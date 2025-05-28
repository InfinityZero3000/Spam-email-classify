import { useEffect } from 'react';

/**
 * Custom hook to set the document title
 * @param {string} title - The title to set
 * @param {string} suffix - Optional suffix to append to the title (defaults to "Spam Email Classifier")
 */
const useDocumentTitle = (title, suffix = "Spam Email Classifier") => {
    useEffect(() => {
        // Set the document title when the component mounts
        const fullTitle = title ? `${title} | ${suffix}` : suffix;
        document.title = fullTitle;

        // Restore the original title when the component unmounts
        return () => {
            document.title = suffix;
        };
    }, [title, suffix]);
};

export default useDocumentTitle;
