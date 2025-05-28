// Hàm loại bỏ các thẻ HTML từ văn bản - phiên bản cải tiến
export const stripHtmlTags = (html) => {
    if (!html) return "";

    try {
        // Phương pháp 1: Sử dụng DOM API
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Loại bỏ các phần tử script và style
        const scripts = tempDiv.getElementsByTagName("script");
        const styles = tempDiv.getElementsByTagName("style");

        // Xóa từ cuối lên đầu để tránh vấn đề với NodeList động
        for (let i = scripts.length - 1; i >= 0; i--) {
            scripts[i].parentNode.removeChild(scripts[i]);
        }

        for (let i = styles.length - 1; i >= 0; i--) {
            styles[i].parentNode.removeChild(styles[i]);
        }

        // Lấy văn bản thuần túy
        let text = tempDiv.textContent || tempDiv.innerText || "";

        // Phương pháp 2: Sử dụng regex để đảm bảo loại bỏ tất cả các thẻ còn sót lại
        // Loại bỏ tất cả các thẻ HTML còn sót lại
        text = text.replace(/<[^>]*>/g, "");

        // Loại bỏ khoảng trắng thừa và ký tự đặc biệt
        text = text.replace(/\s+/g, " ").trim();

        return text;
    } catch (error) {
        console.error("Lỗi khi loại bỏ HTML:", error);

        // Phương pháp dự phòng: Sử dụng regex
        return html
            .replace(/<[^>]*>/g, "") // Loại bỏ tất cả các thẻ HTML
            .replace(/&nbsp;/g, " ") // Thay thế &nbsp; bằng khoảng trắng
            .replace(/&amp;/g, "&") // Thay thế &amp; bằng &
            .replace(/&lt;/g, "<") // Thay thế &lt; bằng <
            .replace(/&gt;/g, ">") // Thay thế &gt; bằng >
            .replace(/&quot;/g, '"') // Thay thế &quot; bằng "
            .replace(/&#39;/g, "'") // Thay thế &#39; bằng '
            .replace(/\s+/g, " ") // Loại bỏ khoảng trắng thừa
            .trim(); // Loại bỏ khoảng trắng ở đầu và cuối
    }
};
