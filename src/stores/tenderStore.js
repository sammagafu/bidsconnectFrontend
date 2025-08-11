import { defineStore } from 'pinia'

const initialTender = () => ({
  title: '',
  reference_number: '',
  tender_type_country: 'National',
  tender_type_sector: 'Private Company',
  tenderdescription: '',
  submission_deadline: null,
  clarification_deadline: null,
  evaluation_start_date: null,
  evaluation_end_date: null,
  category_id: null,
  subcategory_id: null,
  procurement_process_id: null,
  tender_fees: null,
  agency_id: null,
  validity_period_days: null,
  completion_period_days: null,
  litigation_history_start: null,
  litigation_history_end: null,
  tender_document: null,
  tender_securing_type: 'Tender Security',
  tender_security_percentage: null,
  tender_security_amount: null,
  tender_security_currency: 'TZS',
})

export const useTenderStore = defineStore('tender', {
  state: () => ({
    tender: initialTender(),
    step: 1,
    requiredDocuments: [{ name: '', description: '', document_type: '' }],
    selectedAgencyName: '',
  }),

  actions: {
    next() {
      if (this.step < 6) this.step++
    },
    back() {
      if (this.step > 1) this.step--
    },
    resetAll() {
      this.tender = initialTender()
      this.step = 1
      this.requiredDocuments = [{ name: '', description: '', document_type: '' }]
      this.selectedAgencyName = ''
    },
    addDocument() {
      this.requiredDocuments.push({ name: '', description: '', document_type: '' })
    },
    removeDocument(idx) {
      this.requiredDocuments.splice(idx, 1)
    },
  },

  // Persist into localStorage under "tender-store"
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'tender-store',
        storage: window.localStorage,
        // only these state paths will be saved/restored
        paths: ['tender', 'step', 'requiredDocuments', 'selectedAgencyName'],
      },
    ],
  },
})
