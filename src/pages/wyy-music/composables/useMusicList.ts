// src/pages/wyy-music/composables/useMusicList.ts
import { ref, computed, type Ref } from "vue";
import type { SimpleMusicItem } from "@/pages/wyy-music/types/music";


/**
 * 自定义 Hook - 音乐列表管理
 * 展示 TypeScript 高级技巧：
 * 1. 泛型支持 - <T>
 * 2. 函数返回类型定义 - UseMusicListReturn<T>
 * 3. 工具类型 - Partial, Record, ReturnType
 * 4. 类型守卫 - is 关键字
 * 5. 类型断言 - as
 */

// ==================== 类型定义 ====================

/**
 * Hook 配置选项
 * 使用 Partial 让所有字段变为可选
 */
export interface UseMusicListOptions<T> {
    /** 数据获取函数 */
    fetchFn: () => Promise<T[]>;
    /** 是否立即执行 */
    immediate?: boolean;
    /** 初始数据 */
    initialData?: T[];
    /** 错误处理回调 */
    onError?: (error: Error) => void;
}

/**
 * Hook 返回类型
 * 明确定义返回值的类型结构
 */
export interface UseMusicListReturn<T> {
    /** 数据列表 */
    list: Ref<T[]>;
    /** 加载状态 */
    loading: Ref<boolean>;
    /** 错误信息 */
    error: Ref<string | null>;
    /** 获取数据函数 */
    fetchList: () => Promise<void>;
    /** 重新获取数据 */
    refresh: () => Promise<void>;
    /** 数据数量 */
    count: Ref<number>;
    /** 是否为空 */
    isEmpty: Ref<boolean>;
}

// ==================== 类型守卫 ====================

/**
 * 类型守卫 - 检查是否为 Error 对象
 * 使用 is 关键字进行类型保护
 */
function isError(error: unknown): error is Error {
    return error instanceof Error;
}

/**
 * 类型守卫 - 检查是否为数组
 */
function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

// ==================== 泛型函数实现 ====================

/**
 * 音乐列表管理 Hook
 * @template T - 数据项类型
 * @param options - 配置选项
 * @returns Hook 返回值
 * 
 * @example
 * const { list, loading, error, fetchList } = useMusicList<SimpleMusicItem>({
 *   fetchFn: async () => {
 *     const res = await getLiRongHaoSongs({ limit: 15 });
 *     return res.data.songs.map(toSimpleMusicItem);
 *   },
 *   immediate: true
 * });
 */
export function useMusicList<T>(options: UseMusicListOptions<T>): UseMusicListReturn<T> {
    // ==================== Ref 类型定义 ====================

    // 使用泛型 Ref<T> 定义响应式引用
    const list = ref<T[]>(options.initialData || []) as Ref<T[]>;

    // 自动推导类型为 boolean
    const loading = ref(false);

    // 使用联合类型定义错误信息
    const error = ref<string | null>(null);

    // ==================== Computed 类型定义 ====================

    // computed 的返回类型自动推导
    const count = computed(() => list.value.length);

    // 显式指定 computed 的返回类型
    const isEmpty = computed<boolean>(() => list.value.length === 0);

    // ==================== 函数类型定义 ====================

    /**
     * 获取数据函数
     * 使用 async/await 和 Promise 类型
     */
    const fetchList = async (): Promise<void> => {
        try {
            loading.value = true;
            error.value = null;

            // 调用数据获取函数
            const data = await options.fetchFn();

            // 类型守卫检查
            if (isArray<T>(data)) {
                list.value = data;
            } else {
                // 类型断言
                list.value = data as T[];
            }

        } catch (err) {
            // 使用类型守卫处理错误
            if (isError(err)) {
                error.value = err.message;
                options.onError?.(err);
            } else {
                // 类型断言处理未知错误
                error.value = (err as Error).message || "未知错误";
            }
        } finally {
            loading.value = false;
        }
    };

    /**
     * 重新获取数据
     * 使用 ReturnType 获取函数返回类型
     */
    const refresh = async (): Promise<void> => {
        return fetchList();
    };

    // ==================== 立即执行 ====================

    // 使用可选链和空值合并
    if (options.immediate ?? false) {
        fetchList();
    }

    // ==================== 返回值 ====================

    return {
        list,
        loading,
        error,
        fetchList,
        refresh,
        count,
        isEmpty
    };
}

// ==================== 工具类型示例 ====================

/**
 * 示例：使用 Partial 工具类型 - 可选属性
 */
export type PartialOptions<T> = Partial<UseMusicListOptions<T>>;

/**
 * 示例：使用 Required 工具类型 - 必填属性
 */
export type RequiredOptions<T> = Required<UseMusicListOptions<T>>;

/**
 * 示例：使用 Pick 工具类型 - 选择 指定 属性
 */
export type FetchFnOptions<T> = Pick<UseMusicListOptions<T>, 'fetchFn'>;

/**
 * 示例：使用 Omit 工具类型 - 排除 指定 属性
 */
export type OptionsWithoutFetch<T> = Omit<UseMusicListOptions<T>, 'fetchFn'>;

/**
 * 示例：使用 Record 工具类型 - 缓存音乐列表
 */
export type MusicListCache<T> = Record<string, T[]>;

/**
 * 示例：使用 ReturnType 工具类型 - 获取函数返回类型
 */
export type FetchListReturnType = ReturnType<typeof useMusicList<SimpleMusicItem>>;

// ==================== 类型推断示例 ====================

/**
 * 示例：从函数参数推断类型
 */
export type InferFetchFnType<T> = T extends UseMusicListOptions<infer U> ? U : never;

/**
 * 示例：从返回值推断类型
 */
export type InferListType<T> = T extends UseMusicListReturn<infer U> ? U : never;

// ==================== 泛型约束示例 ====================

/**
 * 示例：泛型约束 - T 必须是对象类型
 */
export interface ObjectConstraint {
    id: number | string;
}

export function useMusicListWithConstraint<T extends ObjectConstraint>(
    options: UseMusicListOptions<T>
): UseMusicListReturn<T> {
    // 实现逻辑...
    return useMusicList<T>(options);
}

// ==================== 条件类型示例 ====================

/**
 * 示例：条件类型 - 根据类型选择不同的处理方式
 */
export type DataType<T> =
    T extends string ? 'string' :
    T extends number ? 'number' :
    T extends boolean ? 'boolean' : 'object';

/**
 * 示例：映射类型 - 批量修改类型属性
 */
export type NullableMusicList<T> = {
    [K in keyof T]: T[K] | null;
};
