import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../contact.entity';

export interface DuplicateGroup {
  matchField: 'email' | 'phone' | 'name';
  matchValue: string;
  contacts: Contact[];
  confidence: 'high' | 'medium' | 'low';
}

export interface MergeContactsDto {
  primaryContactId: string;
  duplicateContactIds: string[];
  mergeStrategy?: {
    preferNewer?: boolean;
    keepAllTags?: boolean;
    keepAllNotes?: boolean;
    keepAllActivities?: boolean;
  };
}

@Injectable()
export class DeduplicationService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  /**
   * Find potential duplicate contacts
   */
  async findDuplicates(tenantId: string): Promise<DuplicateGroup[]> {
    const allContacts = await this.contactRepository.find({
      where: { tenantId },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });

    const duplicateGroups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    // Find exact email matches (high confidence)
    const emailMap = new Map<string, Contact[]>();
    allContacts.forEach(contact => {
      if (contact.email && !processedIds.has(contact.id)) {
        const email = contact.email.toLowerCase().trim();
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email)!.push(contact);
      }
    });

    emailMap.forEach((contacts, email) => {
      if (contacts.length > 1) {
        duplicateGroups.push({
          matchField: 'email',
          matchValue: email,
          contacts,
          confidence: 'high',
        });
        contacts.forEach(c => processedIds.add(c.id));
      }
    });

    // Find exact phone matches (high confidence)
    const phoneMap = new Map<string, Contact[]>();
    allContacts.forEach(contact => {
      if (contact.phone && !processedIds.has(contact.id)) {
        const phone = contact.phone.replace(/\D/g, ''); // Remove non-digits
        if (phone.length >= 10) {
          // Only consider valid phone numbers
          if (!phoneMap.has(phone)) {
            phoneMap.set(phone, []);
          }
          phoneMap.get(phone)!.push(contact);
        }
      }
    });

    phoneMap.forEach((contacts, phone) => {
      if (contacts.length > 1) {
        duplicateGroups.push({
          matchField: 'phone',
          matchValue: phone,
          contacts,
          confidence: 'high',
        });
        contacts.forEach(c => processedIds.add(c.id));
      }
    });

    // Find fuzzy name matches within same company (medium confidence)
    const companyNameMap = new Map<string, Contact[]>();
    allContacts.forEach(contact => {
      if (contact.company && (contact.firstName || contact.lastName) && !processedIds.has(contact.id)) {
        const company = contact.company.toLowerCase().trim();
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase().trim();
        const key = `${company}:${fullName}`;

        if (!companyNameMap.has(key)) {
          companyNameMap.set(key, []);
        }
        companyNameMap.get(key)!.push(contact);
      }
    });

    companyNameMap.forEach((contacts, key) => {
      if (contacts.length > 1) {
        const [company, name] = key.split(':');
        duplicateGroups.push({
          matchField: 'name',
          matchValue: `${name} at ${company}`,
          contacts,
          confidence: 'medium',
        });
        contacts.forEach(c => processedIds.add(c.id));
      }
    });

    return duplicateGroups.sort((a, b) => {
      // Sort by confidence (high first) then by number of duplicates (most first)
      if (a.confidence !== b.confidence) {
        return a.confidence === 'high' ? -1 : 1;
      }
      return b.contacts.length - a.contacts.length;
    });
  }

  /**
   * Merge duplicate contacts
   */
  async mergeContacts(
    mergeDto: MergeContactsDto,
    tenantId: string,
  ): Promise<Contact> {
    const { primaryContactId, duplicateContactIds, mergeStrategy = {} } = mergeDto;

    if (!duplicateContactIds || duplicateContactIds.length === 0) {
      throw new BadRequestException('No duplicate contacts specified');
    }

    // Get primary contact
    const primaryContact = await this.contactRepository.findOne({
      where: { id: primaryContactId, tenantId },
      relations: ['tags'],
    });

    if (!primaryContact) {
      throw new BadRequestException('Primary contact not found');
    }

    // Get duplicate contacts
    const duplicateContacts = await this.contactRepository.find({
      where: duplicateContactIds.map(id => ({ id, tenantId })),
      relations: ['tags'],
    });

    if (duplicateContacts.length === 0) {
      throw new BadRequestException('No duplicate contacts found');
    }

    // Merge logic
    const merged = { ...primaryContact };

    duplicateContacts.forEach(duplicate => {
      // Fill in missing fields from duplicates
      if (!merged.phone && duplicate.phone) merged.phone = duplicate.phone;
      if (!merged.company && duplicate.company) merged.company = duplicate.company;
      if (!merged.jobTitle && duplicate.jobTitle) merged.jobTitle = duplicate.jobTitle;
      if (!merged.address && duplicate.address) merged.address = duplicate.address;
      if (!merged.city && duplicate.city) merged.city = duplicate.city;
      if (!merged.state && duplicate.state) merged.state = duplicate.state;
      if (!merged.zipCode && duplicate.zipCode) merged.zipCode = duplicate.zipCode;
      if (!merged.country && duplicate.country) merged.country = duplicate.country;

      // Merge custom fields
      if (duplicate.customFields) {
        merged.customFields = {
          ...merged.customFields,
          ...duplicate.customFields,
        };
      }

      // Merge tags
      if (mergeStrategy.keepAllTags !== false) {
        const existingTagIds = merged.tags?.map(t => t.id) || [];
        const newTags = duplicate.tags?.filter(t => !existingTagIds.includes(t.id)) || [];
        merged.tags = [...(merged.tags || []), ...newTags];
      }

      // Use higher score
      if ((duplicate.score || 0) > (merged.score || 0)) {
        merged.score = duplicate.score;
      }

      // Use newer lastContactedAt
      if (duplicate.lastContactedAt) {
        if (!merged.lastContactedAt || new Date(duplicate.lastContactedAt) > new Date(merged.lastContactedAt)) {
          merged.lastContactedAt = duplicate.lastContactedAt;
        }
      }
    });

    // Save merged contact
    const savedContact = await this.contactRepository.save(merged);

    // TODO: In a full implementation, we would:
    // 1. Reassign all notes from duplicates to primary
    // 2. Reassign all activities from duplicates to primary
    // 3. Reassign all tasks from duplicates to primary
    // 4. Reassign all opportunities from duplicates to primary
    // 5. Add a note to primary contact documenting the merge
    // 6. Delete duplicate contacts

    // For now, just delete the duplicates
    await this.contactRepository.remove(duplicateContacts);

    return savedContact;
  }

  /**
   * Get duplicate statistics
   */
  async getDuplicateStats(tenantId: string): Promise<{
    totalDuplicateGroups: number;
    totalDuplicateContacts: number;
    byConfidence: { high: number; medium: number; low: number };
  }> {
    const duplicates = await this.findDuplicates(tenantId);

    const totalDuplicateContacts = duplicates.reduce(
      (sum, group) => sum + (group.contacts.length - 1), // -1 because one will be kept
      0,
    );

    const byConfidence = {
      high: duplicates.filter(d => d.confidence === 'high').length,
      medium: duplicates.filter(d => d.confidence === 'medium').length,
      low: duplicates.filter(d => d.confidence === 'low').length,
    };

    return {
      totalDuplicateGroups: duplicates.length,
      totalDuplicateContacts,
      byConfidence,
    };
  }
}
