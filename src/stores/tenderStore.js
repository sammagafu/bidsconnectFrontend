import { defineStore } from 'pinia';

const initialTender = () => ({
  title: '',
  reference_number: '',
  tender_type_country: 'National',
  tender_type_sector: 'Private Company',
  description: '',
  currency: 'TZS',
  source_of_funds: 'government',
  category_id: null,
  subcategory_id: null,
  procurement_process_id: null,
  agency_id: null,
  tender_fees: null,
  re_advertisement_count: 0,
  re_advertised_from_id: null,
  publication_date: null,
  submission_deadline: null,
  validity_period_days: 90,
  completion_period_days: null,
  allow_alternative_delivery: false,
  litigation_history_start: null,
  litigation_history_end: null,
  tender_document: null,
  tender_securing_type: 'Tender Securing Declaration',
  tender_security_percentage: null,
  tender_security_amount: null,
  tender_security_currency: 'TZS',
  version: 1
});

export const useTenderStore = defineStore('tender', {
  state: () => ({
    tender: initialTender(),
    step: 1,
    selectedAgencyName: '',
    requiredDocuments: [{ selectedName: '', customName: '', description: '', document_type: 'other', is_required: 'required' }],
    financialRequirements: [],
    turnoverRequirements: [],
    experienceRequirements: [],
    personnelRequirements: [],
    scheduleItems: [],
    technicalSpecifications: []
  }),

  actions: {
    next() {
      if (this.step < 12) this.step++;
    },
    back() {
      if (this.step > 1) this.step--;
    },
    resetAll() {
      this.tender = initialTender();
      this.step = 1;
      this.selectedAgencyName = '';
      this.requiredDocuments = [{ selectedName: '', customName: '', description: '', document_type: 'other', is_required: 'required' }];
      this.financialRequirements = [];
      this.turnoverRequirements = [];
      this.experienceRequirements = [];
      this.personnelRequirements = [];
      this.scheduleItems = [];
      this.technicalSpecifications = [];
    },
    addDocument() {
      this.requiredDocuments.push({ selectedName: '', customName: '', description: '', document_type: 'other', is_required: 'required' });
    },
    removeDocument(idx) {
      this.requiredDocuments.splice(idx, 1);
    },
    addFinancialRequirement() {
      this.financialRequirements.push({
        name: '',
        formula: '',
        minimum: null,
        unit: '',
        actual_value: null,
        notes: '',
        financial_sources: '',
        start_date: null,
        end_date: null,
        jv_compliance: 'combined',
        jv_percentage: null
      });
    },
    removeFinancialRequirement(idx) {
      this.financialRequirements.splice(idx, 1);
    },
    addTurnoverRequirement() {
      this.turnoverRequirements.push({
        label: '',
        amount: null,
        currency: 'TZS',
        start_date: null,
        end_date: null,
        jv_compliance: 'combined',
        jv_percentage: null
      });
    },
    removeTurnoverRequirement(idx) {
      this.turnoverRequirements.splice(idx, 1);
    },
    addExperienceRequirement() {
      this.experienceRequirements.push({
        type: 'specific',
        description: '',
        contract_count: null,
        min_value: null,
        currency: 'TZS',
        start_date: null,
        end_date: null,
        jv_compliance: 'combined',
        jv_percentage: null,
        jv_aggregation_note: '',
        reputation_notes: ''
      });
    },
    removeExperienceRequirement(idx) {
      this.experienceRequirements.splice(idx, 1);
    },
    addPersonnelRequirement() {
      this.personnelRequirements.push({
        role: '',
        min_education: 'bachelor',
        professional_registration: '',
        min_experience_yrs: null,
        appointment_duration_years: null,
        nationality_required: '',
        language_required: '',
        age_min: 18,
        age_max: 60,
        specialized_education: '',
        professional_certifications: '',
        jv_compliance: 'combined',
        notes: ''
      });
    },
    removePersonnelRequirement(idx) {
      this.personnelRequirements.splice(idx, 1);
    },
    addScheduleItem() {
      this.scheduleItems.push({
        commodity: '',
        code: '',
        unit: '',
        quantity: null,
        specification: ''
      });
    },
    removeScheduleItem(idx) {
      this.scheduleItems.splice(idx, 1);
    },
    addTechnicalSpecification() {
      this.technicalSpecifications.push({
        category: 'service',
        description: ''
      });
    },
    removeTechnicalSpecification(idx) {
      this.technicalSpecifications.splice(idx, 1);
    }
  },

  // Persist into localStorage under "tender-store"
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'tender-store',
        storage: window.localStorage,
        paths: [
          'tender',
          'step',
          'selectedAgencyName',
          'requiredDocuments',
          'financialRequirements',
          'turnoverRequirements',
          'experienceRequirements',
          'personnelRequirements',
          'scheduleItems',
          'technicalSpecifications'
        ]
      }
    ]
  }
});