import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
    state: () => ({
        searchTerm: '' // 搜索词
    }),

    actions: {
        setSearchTerm(term: string) {
            this.searchTerm = term
        },

        clearSearch() {
            this.searchTerm = ''
        }
    }
})