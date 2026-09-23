// English (convenience) translation of the Korean Privacy Policy for dwee (Innerglow).
// The Korean original (privacy-ko.ts) governs in case of any discrepancy.
// Source: src/content/legal/privacy-ko.ts. Keep this file's section/block
// structure identical to the Korean source when either is updated.

import type { PrivacyDocument } from './privacy-ko';

export const PRIVACY_EN: PrivacyDocument = {
  title: 'dwee Privacy Policy',
  effectiveDate: 'Effective date: September 23, 2026',
  intro:
    'This English version is provided for convenience. The Korean original governs in case of any discrepancy. ' +
    'dwee (the "Service") values Users’ personal information and complies with the Personal Information Protection Act (Korea) and other applicable laws. This Privacy Policy explains how dwee processes personal information in the course of providing the Service, including the purposes of processing, the items processed, collection methods, retention and use periods, destruction methods, third-party provision and outsourcing of processing, overseas transfer, Users’ rights, and the measures dwee takes to protect personal information.',
  sections: [
    {
      heading: 'Article 1 (Matters concerning the processing of personal information)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee processes the minimum personal information necessary to provide the Service, and informs Users of the details whenever personal information is processed. Where consent to the processing of personal information is required, dwee lets Users review the purpose of processing, the items processed, and the retention and use period before choosing whether to consent. Consent to required items is necessary to provide the Service, but declining consent to optional items does not restrict Users’ access to the Service’s basic features.',
        },
      ],
    },
    {
      heading: 'Article 2 (Purposes of processing personal information)',
      blocks: [
        { kind: 'text', text: 'dwee processes personal information for the following purposes.' },
        { kind: 'subhead', text: '1. Membership registration and management' },
        {
          kind: 'bullets',
          items: [
            'Registration and login using Apple and Google accounts',
            'User identification and membership management',
            'Managing account and usage status as Users use the Service',
          ],
        },
        { kind: 'subhead', text: '2. Providing calendar and wellness-tracking features' },
        {
          kind: 'bullets',
          items: [
            'Storing and providing period dates, condition, symptoms, temperature, notes, and events that Users log themselves',
            'Providing calendar and wellness-tracking features based on Users’ logged records',
            'Providing personalized features based on Users’ logged records',
          ],
        },
        { kind: 'subhead', text: '3. Providing photo-based features' },
        {
          kind: 'bullets',
          items: [
            'Body-type analysis using body-type photos provided by the User',
            'Providing body-type analysis results and saving them to My Page',
            'Creating sticker images by removing the background from photos the User captures or selects',
            'Providing in-Service features, such as calendar decoration, using the sticker images created',
            'Storing the sticker images created and supporting their use within the Service',
          ],
        },
        {
          kind: 'text',
          text: 'Original photos provided for body-type analysis and sticker creation are processed only to the extent necessary for each feature’s purpose, and original photos that do not need to be separately retained are deleted once processing for that feature is complete.',
        },
        { kind: 'subhead', text: '4. Customer inquiries and Service support' },
        {
          kind: 'bullets',
          items: [
            'Responding to User inquiries and requests',
            'Identifying and resolving issues that arise while using the Service',
            'Maintaining Service stability and operations',
          ],
        },
        { kind: 'subhead', text: '5. Service improvement and optional marketing' },
        {
          kind: 'text',
          text: 'Where a User separately consents, dwee may process personal information for the following purposes.',
        },
        {
          kind: 'bullets',
          items: [
            'Analyzing Service usage and improving the Service',
            'Developing new features and improving Service quality',
            'Providing information about events and promotions',
          ],
        },
        {
          kind: 'text',
          text: 'Users can access the Service’s basic features without consenting to this optional processing; if a User does not consent, they may not receive personalized guidance or promotions based on that information.',
        },
        { kind: 'subhead', text: '6. Community features' },
        {
          kind: 'text',
          text: 'dwee does not currently offer community features. If community features are added in the future, content that Users create — such as posts and comments — may be processed for purposes such as providing the community features, supporting communication among Users, and managing content operations. When community features are introduced, dwee will update this Privacy Policy to reflect the relevant items processed, purposes of processing, and retention and use periods.',
        },
      ],
    },
    {
      heading: 'Article 3 (Items of personal information processed and collection methods)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee processes the minimum personal information necessary to provide the Service.',
        },
        { kind: 'subhead', text: '1. Registration and login' },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Apple login' },
            {
              label: 'Items processed',
              value: 'Email and user-identification information provided via the Apple account',
            },
            { label: 'Purpose of processing', value: 'Registration and login' },
            { label: 'Retention and use period', value: 'Until account deletion' },
          ],
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Google login' },
            {
              label: 'Items processed',
              value:
                'Email, name, and user-identification information provided via the Google account',
            },
            { label: 'Purpose of processing', value: 'Registration and login' },
            { label: 'Retention and use period', value: 'Until account deletion' },
          ],
        },
        {
          kind: 'text',
          text: '※ dwee processes only the items it actually collects and stores among the information each login provider makes available.',
        },
        { kind: 'subhead', text: '2. Calendar and wellness-tracking records' },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Calendar and wellness-tracking records' },
            {
              label: 'Items processed',
              value:
                'Period start/end dates, condition, symptoms, temperature, notes, events, etc.',
            },
            {
              label: 'Purpose of processing',
              value: 'Providing calendar and wellness-tracking features',
            },
            { label: 'Retention and use period', value: 'Until account deletion' },
          ],
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'User information' },
            {
              label: 'Items processed',
              value:
                'Nickname, date of birth, gender, and other information provided while using the Service',
            },
            {
              label: 'Purpose of processing',
              value: 'Service convenience and personalized features',
            },
            { label: 'Retention and use period', value: 'Until account deletion' },
          ],
        },
        {
          kind: 'text',
          text: 'Where information related to health status — such as period, symptoms, or temperature — constitutes sensitive information under the Personal Information Protection Act (Korea), dwee processes it only after a separate consent process required by applicable law, and applies the measures necessary to secure its safety.',
        },
        { kind: 'subhead', text: '3. Body-type analysis' },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Body-type analysis photo' },
            {
              label: 'Items processed',
              value: 'Actual body-type photo the User captures or selects and provides',
            },
            { label: 'Purpose of processing', value: 'Body-type analysis' },
            {
              label: 'Retention and use period',
              value: 'Deleted immediately after analysis is complete',
            },
          ],
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Body-type analysis result' },
            {
              label: 'Items processed',
              value: 'Result information generated through body-type analysis',
            },
            {
              label: 'Purpose of processing',
              value: 'Providing the result and saving it to My Page',
            },
            { label: 'Retention and use period', value: 'Until account deletion' },
          ],
        },
        {
          kind: 'text',
          text: 'dwee does not use the original photo provided for body-type analysis for any purpose other than the analysis. Once the analysis is complete, the original photo is automatically deleted and is not saved to My Page. The body-type analysis result is retained until account deletion so that Users can view it on My Page.',
        },
        { kind: 'subhead', text: '4. Sticker creation' },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Sticker-creation photo' },
            {
              label: 'Items processed',
              value: 'Photo the User captures or selects from the device',
            },
            {
              label: 'Purpose of processing',
              value: 'Creating a sticker image by removing the background from the photo',
            },
            {
              label: 'Retention and use period',
              value: 'For the period necessary to create the sticker',
            },
          ],
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Sticker image created' },
            {
              label: 'Items processed',
              value: 'Sticker image generated with the background removed',
            },
            {
              label: 'Purpose of processing',
              value: 'Storage and use in in-Service features such as calendar decoration',
            },
            {
              label: 'Retention and use period',
              value: 'Until the User deletes it or until account deletion',
            },
          ],
        },
        {
          kind: 'text',
          text: 'dwee uses the original photo the User provides for sticker creation only to the extent necessary for background removal. Where the original photo is not separately retained, dwee deletes it without delay once sticker creation is complete. The resulting sticker image is managed separately from the original photo, is used only within internal Service features such as calendar decoration, and is deleted when the User deletes it or upon account deletion.',
        },
        { kind: 'subhead', text: '5. Photo and device permissions' },
        {
          kind: 'text',
          text: 'dwee may request device permissions from Users to provide features such as taking photos, body-type analysis, and sticker creation. Camera permission is used when the User takes a photo directly. Photo-library access permission is used when the User selects a photo stored on the device to use features such as body-type analysis or sticker creation. dwee processes the photo the User selects or captures only to the extent necessary to provide that feature, and does not use photo-library access permission for any other purpose.',
        },
        { kind: 'subhead', text: '6. Customer inquiries' },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Customer inquiry' },
            { label: 'Items processed', value: 'Email address, inquiry content, etc.' },
            { label: 'Purpose of processing', value: 'Receiving and responding to inquiries' },
            {
              label: 'Retention and use period',
              value: 'Within 1 year after the inquiry is resolved',
            },
          ],
        },
        {
          kind: 'subhead',
          text: '7. Information automatically generated and collected while using the Service',
        },
        {
          kind: 'text',
          text: 'While Users use the Service, information such as IP address, access logs, Service usage records, device information, operating system and app version information, and error/failure-related information may be generated and collected. Where dwee uses an external analytics tool, advertising SDK, or other third-party service, dwee will review the information that service collects, its purpose, and its retention period, and reflect the necessary details in this Privacy Policy.',
        },
        { kind: 'subhead', text: '8. Error logs' },
        {
          kind: 'kv',
          rows: [
            { label: 'Category', value: 'Error logs' },
            {
              label: 'Items processed',
              value:
                'Device model, OS version, app version, the error message and stack trace, and the screen where the error occurred',
            },
            {
              label: 'Purpose of processing',
              value: 'Fixing defects and maintaining Service stability',
            },
            {
              label: 'Retention and use period',
              value: 'Deleted automatically 90 days after collection',
            },
          ],
        },
        {
          kind: 'text',
          text: 'Error logs are generated and collected automatically when the app crashes unexpectedly or encounters an error, and do not include personal information Users enter directly — such as email address, diary/condition/period records, or photos. That information is removed on the device before the log is sent.',
        },
        { kind: 'subhead', text: '9. Methods of collecting personal information' },
        { kind: 'text', text: 'dwee collects personal information through the following methods.' },
        {
          kind: 'bullets',
          items: [
            'Registration and login via Apple and Google login',
            'Information the User enters or registers directly within the Service',
            'Photos the User captures or selects directly for body-type analysis',
            'Photos the User captures or selects directly for sticker creation',
            'Information the User provides directly in the course of a customer inquiry',
            'Information automatically generated and collected while using the Service',
          ],
        },
        {
          kind: 'text',
          text: 'Where additional personal information is processed depending on the collection channel, dwee will inform Users so that they can review it.',
        },
      ],
    },
    {
      heading: 'Article 4 (Processing and retention period of personal information)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee destroys personal information without delay once the purpose of processing is achieved or the retention period ends.',
        },
        { kind: 'subhead', text: '1. Membership information' },
        {
          kind: 'text',
          text: 'Retained and used until account deletion, and destroyed without delay once account deletion is complete.',
        },
        { kind: 'subhead', text: '2. Calendar and wellness-tracking records' },
        {
          kind: 'text',
          text: 'Retained until account deletion for the purpose of providing the Service, and destroyed without delay upon account deletion.',
        },
        { kind: 'subhead', text: '3. Body-type analysis photo' },
        {
          kind: 'text',
          text: 'Processed temporarily for body-type analysis and automatically deleted as soon as the analysis is complete. dwee does not retain the original photo long-term in order to provide the body-type analysis result.',
        },
        { kind: 'subhead', text: '4. Body-type analysis result' },
        {
          kind: 'text',
          text: 'Retained until account deletion so that Users can view their body-type analysis result on My Page, and destroyed without delay upon account deletion.',
        },
        { kind: 'subhead', text: '5. Sticker-creation photo (original)' },
        {
          kind: 'text',
          text: 'Processed temporarily to the extent necessary for background removal; where the original photo is not separately retained, it is deleted without delay once sticker creation is complete.',
        },
        { kind: 'subhead', text: '6. Sticker image created' },
        {
          kind: 'text',
          text: 'Retained within in-Service features such as calendar decoration until the User deletes it directly or until account deletion, and destroyed without delay once that period ends.',
        },
        { kind: 'subhead', text: '7. Customer inquiries' },
        {
          kind: 'text',
          text: 'Retained for up to 1 year after the inquiry is resolved, and destroyed without delay once the retention period ends.',
        },
        { kind: 'subhead', text: '8. Error logs' },
        {
          kind: 'text',
          text: 'Deleted automatically 90 days after collection.',
        },
        { kind: 'subhead', text: '9. Retention under applicable law' },
        {
          kind: 'text',
          text: 'Where applicable law requires personal information to be retained for a set period, dwee retains it for the period specified by that law. Personal information retained under applicable law is not used for any purpose other than that retention purpose.',
        },
      ],
    },
    {
      heading: 'Article 5 (Procedures and methods for destroying personal information)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee destroys personal information without delay once the retention period has elapsed or the purpose of processing has been achieved.',
        },
        { kind: 'subhead', text: '1. Destruction procedure' },
        {
          kind: 'text',
          text: 'Once the retention period ends or the purpose of processing is achieved, personal information is included among items to be destroyed and is safely destroyed in accordance with internal procedures. The original photo temporarily processed for body-type analysis is automatically deleted once the analysis is complete. The original photo temporarily processed for sticker creation is likewise deleted without delay after creation is complete, where it does not need to be separately retained.',
        },
        { kind: 'subhead', text: '2. Destruction method' },
        {
          kind: 'text',
          text: 'Personal information stored as an electronic file is deleted using a secure method that prevents recovery or reconstruction. Where personal information exists in printed form, it is destroyed by shredding, incineration, or a similar method.',
        },
      ],
    },
    {
      heading: 'Article 6 (Provision of personal information to third parties)',
      blocks: [
        {
          kind: 'text',
          text: 'In principle, dwee does not provide Users’ personal information to third parties. The following are exceptions.',
        },
        {
          kind: 'bullets',
          items: [
            'Where the User has given prior consent',
            'Where required by a specific provision of law or necessary to comply with a legal obligation',
            'Where necessary for the urgent protection of the life, body, or property interests of a User or a third party, or otherwise permitted under applicable law',
          ],
        },
        { kind: 'subhead', text: 'Body-type test sharing' },
        {
          kind: 'text',
          text: 'dwee provides a test link so that a User can share the body-type test with another person. The link a User shares contains only the information needed to take the test; it does not disclose or share the User’s body-type test result, original body-type photo, or membership personal information. A person who accesses the shared link can take the body-type test offered on that link themselves.',
        },
        { kind: 'subhead', text: 'Scope of use of sticker images' },
        {
          kind: 'text',
          text: 'Sticker images generated through the sticker-creation feature are used only within internal Service features such as calendar decoration, and are not disclosed externally or provided to third parties.',
        },
      ],
    },
    {
      heading: 'Article 7 (Outsourcing of personal information processing)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee may outsource part of its personal information processing operations to outside specialist companies in order to provide the Service smoothly. Where dwee outsources personal information processing, it discloses the processor and the outsourced task through this Privacy Policy as required by applicable law.',
        },
        {
          kind: 'text',
          text: 'Where photo-based AI processing features such as body-type analysis and sticker creation are performed through an external service, dwee reviews who processes the photo, how it is processed, and whether it is retained, distinguishes whether this constitutes outsourced processing or third-party provision, and reflects the relevant details in this Privacy Policy.',
        },
        { kind: 'subhead', text: 'Status of outsourced personal information processing' },
        {
          kind: 'kv',
          rows: [
            { label: 'Processor', value: 'Supabase, Inc.' },
            {
              label: 'Outsourced task',
              value: 'Member authentication, data storage, and file storage',
            },
            {
              label: 'Personal information processed',
              value:
                'Email, account identifier, calendar/wellness-tracking records, sticker images, and other information the User enters or generates in the Service',
            },
            { label: 'Country of processing', value: 'Japan (Tokyo region)' },
          ],
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Processor', value: 'OpenAI, L.L.C.' },
            { label: 'Outsourced task', value: 'Body-type analysis AI processing' },
            {
              label: 'Personal information processed',
              value: 'Photo the User provides for body-type analysis',
            },
            { label: 'Country of processing', value: 'United States' },
            {
              label: 'Processing method',
              value:
                'Transmitted with each API request and deleted immediately after analysis is complete. It may be retained automatically for up to 30 days under OpenAI’s API data policy (abuse monitoring), and is not used to train AI models.',
            },
          ],
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Processor', value: 'Kaleido AI GmbH (remove.bg)' },
            { label: 'Outsourced task', value: 'Photo background removal for sticker creation' },
            {
              label: 'Personal information processed',
              value: 'Photo the User provides for sticker creation',
            },
            { label: 'Country of processing', value: 'Austria and the EU region' },
          ],
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Processor', value: 'Functional Software, Inc. (Sentry)' },
            { label: 'Outsourced task', value: 'Collection and analysis of error logs' },
            {
              label: 'Personal information processed',
              value:
                'Error logs (device model, OS version, app version, error content, screen where it occurred)',
            },
            { label: 'Country of processing', value: 'United States' },
          ],
        },
        {
          kind: 'text',
          text: 'Because the processors above process personal information outside Korea, the detailed overseas-transfer information is provided in Article 8.',
        },
      ],
    },
    {
      heading: 'Article 8 (Overseas transfer of personal information)',
      blocks: [
        {
          kind: 'text',
          text: 'In the course of providing the Service, dwee transfers personal information overseas as follows. In accordance with Article 28-8 of the Personal Information Protection Act (Korea), dwee discloses, for each transfer, the recipient, the destination country, the items transferred, the purpose of transfer, the retention and use period, and the method of transfer, as set out below.',
        },
        { kind: 'subhead', text: '1. Supabase (data storage and authentication)' },
        {
          kind: 'kv',
          rows: [
            { label: 'Recipient', value: 'Supabase, Inc. (contact: privacy@supabase.io)' },
            { label: 'Destination country', value: 'Japan (Tokyo region)' },
            {
              label: 'Items transferred',
              value:
                'Email, account identifier, calendar/wellness-tracking records (period, condition, symptoms, temperature, notes), sticker images, Service usage records',
            },
            {
              label: 'Purpose of transfer',
              value: 'Member authentication and data storage/retrieval',
            },
            {
              label: 'Retention and use period',
              value: 'Until account deletion (destroyed without delay upon deletion)',
            },
            {
              label: 'Method of transfer',
              value: 'Real-time transmission from the app over encrypted HTTPS (TLS) communication',
            },
          ],
        },
        { kind: 'subhead', text: '2. OpenAI (body-type analysis AI)' },
        {
          kind: 'kv',
          rows: [
            { label: 'Recipient', value: 'OpenAI, L.L.C. (contact: privacy@openai.com)' },
            { label: 'Destination country', value: 'United States' },
            { label: 'Items transferred', value: 'Photo the User provides for body-type analysis' },
            {
              label: 'Purpose of transfer',
              value: 'Generating an analysis result through the body-type analysis AI model',
            },
            {
              label: 'Retention and use period',
              value:
                'Deleted immediately after analysis is complete. It may, however, be retained automatically for up to 30 days under OpenAI’s API data policy (abuse monitoring), and is not used to train AI models.',
            },
            {
              label: 'Method of transfer',
              value: 'Server-to-server transmission over encrypted HTTPS (TLS) communication',
            },
          ],
        },
        { kind: 'subhead', text: '3. remove.bg (sticker background removal)' },
        {
          kind: 'kv',
          rows: [
            {
              label: 'Recipient',
              value: 'Kaleido AI GmbH (remove.bg, contact: privacy@remove.bg)',
            },
            { label: 'Destination country', value: 'Austria and the EU region' },
            { label: 'Items transferred', value: 'Photo the User provides for sticker creation' },
            { label: 'Purpose of transfer', value: 'Photo background removal' },
            {
              label: 'Retention and use period',
              value: 'Deleted immediately after background removal is complete',
            },
            {
              label: 'Method of transfer',
              value: 'Server-to-server transmission over encrypted HTTPS (TLS) communication',
            },
          ],
        },
        { kind: 'subhead', text: '4. Sentry (error log collection and analysis)' },
        {
          kind: 'kv',
          rows: [
            {
              label: 'Recipient',
              value: 'Functional Software, Inc. (Sentry, contact: privacy@sentry.io)',
            },
            { label: 'Destination country', value: 'United States' },
            {
              label: 'Items transferred',
              value:
                'Error logs (device model, OS version, app version, error content, screen where it occurred)',
            },
            {
              label: 'Purpose of transfer',
              value: 'Error analysis and Service stabilization',
            },
            {
              label: 'Retention and use period',
              value: '90 days from collection',
            },
            {
              label: 'Method of transfer',
              value: 'Automatically transmitted over the network when an error occurs',
            },
          ],
        },
        {
          kind: 'text',
          text: 'If a User does not wish for the overseas transfer described under Article 28-8(1) of the Personal Information Protection Act (Korea) to take place, the User may decline to register as a member or stop using the related features (body-type analysis and sticker creation). The transfer to Supabase for data storage, however, is required to use the Service, and declining it may limit the User’s access to the Service.',
        },
        {
          kind: 'text',
          text: 'For Apple or Google social login, the User provides authentication information directly to each login provider, and that information is processed under the respective provider’s own privacy policy.',
        },
      ],
    },
    {
      heading:
        'Article 9 (Users’ rights to access, correct, delete, and suspend processing of personal information, and how to exercise them)',
      blocks: [
        {
          kind: 'text',
          text: 'Users may exercise the following rights regarding their personal information at any time.',
        },
        {
          kind: 'bullets',
          items: [
            'Requesting access to their personal information',
            'Requesting correction of their personal information',
            'Requesting deletion of their personal information',
            'Requesting suspension of processing of their personal information',
            'Other personal-information-protection rights provided under applicable law',
          ],
        },
        {
          kind: 'text',
          text: 'Users can exercise these rights directly through the account-deletion or personal-information management features available within the Service. Where a request to access, correct, delete, or suspend processing of personal information cannot be handled directly within the Service, the User may make the request to the Data Protection Officer by email or through the contact channel. Users may also exercise these rights through their legal representative or a duly authorized agent.',
        },
        {
          kind: 'text',
          text: 'dwee processes User requests to exercise these rights in accordance with the procedures set by applicable law. Where dwee receives a request to correct or delete personal information, it does not use or provide that personal information until the correction or deletion is complete. A User may withdraw consent to the collection and use of personal information by deleting their account; once deletion is complete, dwee destroys the personal information without delay, except for information that must be retained under applicable law.',
        },
      ],
    },
    {
      heading: 'Article 10 (Personal information of children under 14 years of age)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee provides the Service to Users 14 years of age or older and, in principle, does not collect or process personal information from children under 14 years of age. If dwee confirms that a child under 14 years of age has registered as a member, dwee will, in accordance with the Personal Information Protection Act (Korea), destroy that child’s personal information and delete the related account without delay.',
        },
        {
          kind: 'text',
          text: 'If you are a parent or legal guardian who becomes aware that a child under 14 has registered, or if you registered while under 14, please contact the Data Protection Officer at the email address in Article 14 (sojjung3@gmail.com). Once dwee verifies the report, it will delete the account and the associated personal information without delay and let you know the outcome.',
        },
      ],
    },
    {
      heading: 'Article 11 (Rights and obligations of data subjects)',
      blocks: [
        {
          kind: 'text',
          text: 'Users have the right to have their personal information protected, and the obligation to provide accurate personal information and not to infringe on the personal information or privacy of others. A User may be responsible for problems that arise from entering inaccurate information. If dwee confirms conduct that disrupts the Service’s normal operation — such as using another person’s personal information without authorization or entering false information — the User’s access to the Service may be restricted under applicable law and the Service’s Terms of Use. Users must manage their account and login information securely so that their personal information can be kept safe.',
        },
      ],
    },
    {
      heading: 'Article 12 (Measures to secure the safety of personal information)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee applies safety measures required under applicable law to process personal information securely and to prevent its loss, theft, leakage, forgery, alteration, or damage. The main measures are as follows.',
        },
        {
          kind: 'bullets',
          items: [
            'Managing access rights to personal information',
            'Controlling access to the personal information processing system',
            'Security measures such as encryption for the safe transmission of personal information',
            'Safe storage and management of personal information',
            'Safe destruction of personal information once the retention period ends or the purpose of processing is achieved',
          ],
        },
        {
          kind: 'text',
          text: 'In particular, original photos provided for body-type analysis and sticker creation are processed only to the extent necessary to provide the Service, and original photos that do not need to be separately retained are deleted once the purpose of processing is achieved, to prevent unnecessary long-term retention.',
        },
      ],
    },
    {
      heading:
        'Article 13 (Installation and operation of automatic personal information collection devices)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee may use cookies or similar technologies to provide the Service and analyze Service usage. Where such automatic collection devices are used, dwee will clearly inform Users of the information collected, the purpose of use, and how Users can decline them.',
        },
        {
          kind: 'text',
          text: 'If dwee uses an external analytics or advertising tool in the future, dwee will review that tool’s method of processing personal information, the items collected, the purpose of use, and the retention period, and reflect them in this Privacy Policy.',
        },
      ],
    },
    {
      heading: 'Article 14 (Data Protection Officer)',
      blocks: [
        {
          kind: 'text',
          text: 'dwee designates the following Data Protection Officer to oversee personal information processing and to handle User inquiries and requests to exercise rights related to personal information.',
        },
        {
          kind: 'kv',
          rows: [
            { label: 'Data Protection Officer', value: 'Soojin Jung' },
            { label: 'Affiliation', value: 'Innerglow' },
            { label: 'Email', value: 'sojjung3@gmail.com' },
            { label: 'Contact', value: 'sojjung3@gmail.com' },
          ],
        },
        {
          kind: 'text',
          text: 'For questions or complaints regarding the processing of personal information, Users may contact dwee using the information above.',
        },
      ],
    },
    {
      heading: 'Article 15 (Remedies for infringement of personal information)',
      blocks: [
        {
          kind: 'text',
          text: 'Where a User needs remedy or consultation for an infringement of personal information, the User may contact the following organizations.',
        },
        {
          kind: 'bullets',
          items: [
            'Personal Information Infringement Report Center: 118 (no area code)',
            'Personal Information Dispute Mediation Committee: 1833-6972',
          ],
        },
        {
          kind: 'text',
          text: 'Users may also seek remedy for infringement of personal information through other channels provided under applicable law.',
        },
      ],
    },
    {
      heading: 'Article 16 (Scope of application)',
      blocks: [
        {
          kind: 'text',
          text: 'This Privacy Policy applies to the dwee Service. Where the dwee Service contains links to other businesses’ or services’ sites, this Privacy Policy does not apply to the processing of personal information on the site or service accessed through that link; that site or service’s own privacy policy applies instead.',
        },
      ],
    },
    {
      heading: 'Article 17 (Changes to this Privacy Policy)',
      blocks: [
        {
          kind: 'text',
          text: 'If content is added to, removed from, or revised in this Privacy Policy, dwee will announce the changes through notices within the Service. Where a material change occurs in the processing of personal information, dwee will carry out the notice or consent procedures required under applicable law.',
        },
      ],
    },
  ],
  changeLog: [
    {
      kind: 'bullets',
      items: ['Announced: September 23, 2026', 'Effective: September 23, 2026'],
    },
  ],
  appendix: 'Addendum\nThis Privacy Policy takes effect on September 23, 2026.',
};
