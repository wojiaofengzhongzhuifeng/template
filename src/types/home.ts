export interface HomePageConfig {
    welcome: {
        title: string;
        colorTitle: string;
        content: string;
    };
    video: {
        image: string;
        video: string;
    };
    list: {
        first: {
            title: string;
            data: Array<{
                href: string;
                text: string;
            }>;
            button: {
                href: string;
                text: string;
                outline: boolean;
            };
        };
        second: {
            title: string;
            data: Array<{
                href: string;
                text: string;
            }>;
            button: {
                href: string;
                text: string;
                outline: boolean;
            };
        };
    };
    typed: string[];
    timeline: Array<{
        title: string;
        content: string;
    }>;
}
