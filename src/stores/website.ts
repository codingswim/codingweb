import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { ref, computed } from 'vue'

export interface Website {
    id: number
    name: string
    url: string
    sort: number
}

export const useWebsiteStore = defineStore('website', () => {
    const loading = ref(false)
    const list = ref<Website[]>([])
    const filteredList = ref<Website[]>([])
    const searchTerm = ref('')

    const debouncedFilteredList = computed(() => {
        if (!searchTerm.value) return list.value
        return list.value.filter(item =>
            item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
    })
    const syncFilteredList = (term: string) => {
        searchTerm.value = term
        filteredList.value = debouncedFilteredList.value // 同步计算结果
    }

    const fetchList = async () => {
        loading.value = true
        const res = await supabase.from('websites').select('*').order('sort', { ascending: true })
        if (!res.error && res.status === 200) {
            list.value = res.data as Website[]
            filteredList.value = res.data
        }
        loading.value = false
    }

    const addWebsite = async (data: Omit<Website, 'id' | 'sort' | 'created_at'>) => {
        loading.value = true
        let newWebsite = {
            ...data,
            sort: list.value.length + 1
        }
        const res = await supabase.from('websites').insert([{ ...newWebsite }])
        if (!res.error) {
            const resList = await supabase.from('websites').select('*').order('sort', { ascending: true })
            if (!resList.error) {
                list.value = resList.data as Website[]
                filteredList.value = resList.data
            }
        }
        loading.value = false
    }


    const deleteWebsite = async (id: number) => {
        loading.value = true
        const res = await supabase.from('websites').delete().eq('id', id)
        if (!res.error) {
            const resList = await supabase.from('websites').select('*').order('sort', { ascending: true })
            if (!resList.error) {
                list.value = resList.data as Website[]
                filteredList.value = resList.data
            }
        }
        loading.value = false
    }

    const updateSort = async () => {
        loading.value = true
        const updateList = list.value.map((item, index) => ({
            id: item.id,
            sort: index + 1
        }))
        // 调用 RPC 函数更新排序
        const res = await supabase.rpc('update_website_sort', { sort_data: updateList }) // 调用 RPC 函数
        if (res.error) throw res.error
        loading.value = false
    }

    return {
        list,
        filteredList,
        loading,

        fetchList,
        addWebsite,
        deleteWebsite,
        updateSort,
        syncFilteredList // 对外暴露同步筛选的方法
    }
})