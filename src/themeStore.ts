import { atom } from 'nanostores';

const initialTheme =
    localStorage.getItem("color-theme") === "dark" || (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? 'dark'
        : 'light';

export const currentTheme = atom<'dark' | 'light'>(initialTheme);
