import { isNil } from 'lodash';

import type { CategoryItem } from '@/server/category/type';

import { categoryApi } from '@/api/category';

import type { IBlogBreadcrumbItem } from './breadcrumb';

/**
 * 获取扁平化(面包屑)分类数据
 * @param categories
 */
export const getBreadcrumbsCategories = async (
    categories?: string[],
): Promise<CategoryItem[] | false> => {
    if (!isNil(categories) && categories.length > 0) {
        const latest = categories[categories.length - 1];
        const result = await categoryApi.breadcrumb(latest);
        if (!result.ok) throw new Error((await result.json()).message);
        const items = await result.json();
        if (items.length !== categories.length) return false;
        if (
            !items.every(
                (item, index) => item.id === categories[index] || item.slug === categories[index],
            )
        ) {
            return false;
        }
        return items;
    }
    return [];
};

/**
 * 获取嵌套面包屑数据
 * @param categories
 * @param type
 */
export const getBreadcrumbsLinks = (
    categories: CategoryItem[],
    type: 'breadcrumb' | 'post' = 'breadcrumb',
): IBlogBreadcrumbItem[] => {
    let link = '';
    return categories.map((category, index) => {
        const item: IBlogBreadcrumbItem = {
            id: category.id,
            text: category.name,
        };
        if (index < categories.length - 1 || type === 'post') {
            link = `${link}/${category.slug || category.id}`;
            item.link = link;
        }
        return item;
    });
};
