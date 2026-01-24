'use client';

import { useGetPublicCountNumberList } from '@/app/(pages)/(home-page)/api/get-public-count-number';
export default function HomePage() {
    useGetPublicCountNumberList();
    return <div>hoemepage</div>;
}
