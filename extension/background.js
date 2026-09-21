// ==============================================================================
// Smart Lexicon AI - Background Service Worker (Manifest V3)
// ==============================================================================

const BASE_URL = "http://localhost:3000/lookup";
const POPUP_WIDTH = 490;
const POPUP_HEIGHT = 760;

// Tạo hoặc tái sử dụng cửa sổ popup tra từ
async function openLookupWindow(word = "") {
  const cleanWord = (word || "").trim();
  let targetUrl = BASE_URL;
  if (cleanWord) {
    targetUrl = `${BASE_URL}?word=${encodeURIComponent(cleanWord)}`;
  }

  try {
    // Tính toán tọa độ hiển thị (bên phải màn hình)
    let left = 1000;
    let top = 80;
    
    // Tạo cửa sổ popup độc lập (App mode, không có thanh địa chỉ)
    await chrome.windows.create({
      url: targetUrl,
      type: "popup",
      width: POPUP_WIDTH,
      height: POPUP_HEIGHT,
      left: left,
      top: top,
      focused: true,
    });
  } catch (err) {
    console.error("Lỗi khi mở cửa sổ popup Smart Lexicon:", err);
    // Fallback: Mở tab mới nếu popup bị chặn
    chrome.tabs.create({ url: targetUrl });
  }
}

// 1. Cài đặt Menu chuột phải (Context Menus)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    // Menu khi bôi đen đoạn chữ
    chrome.contextMenus.create({
      id: "smart-lexicon-selection",
      title: "🔍 Tra từ điển AI cho: \"%s\"",
      contexts: ["selection"],
    });

    // Menu khi click vào khoảng trống trang web
    chrome.contextMenus.create({
      id: "smart-lexicon-open",
      title: "📖 Mở sổ tay từ điển Smart Lexicon",
      contexts: ["page"],
    });
  });
});

// 2. Xử lý sự kiện click Menu chuột phải
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "smart-lexicon-selection" && info.selectionText) {
    openLookupWindow(info.selectionText);
  } else if (info.menuItemId === "smart-lexicon-open") {
    openLookupWindow("");
  }
});

// 3. Xử lý phím tắt trình duyệt (Alt + Q hoặc phím tùy chỉnh)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "lookup-selection") {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab || !activeTab.id) {
        openLookupWindow("");
        return;
      }

      // Trích xuất văn bản đang được bôi đen trong tab hiện tại
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => window.getSelection()?.toString() || "",
      });

      const selectedText = results?.[0]?.result || "";
      openLookupWindow(selectedText);
    } catch (err) {
      console.warn("Không thể lấy selection từ tab, mở popup mặc định:", err);
      openLookupWindow("");
    }
  }
});

// 4. Xử lý khi click vào icon Extension trên thanh công cụ
chrome.action.onClicked.addListener(async (tab) => {
  let selectedText = "";
  if (tab && tab.id) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || "",
      });
      selectedText = results?.[0]?.result || "";
    } catch (e) {
      // bỏ qua lỗi nếu trang nội bộ trình duyệt
    }
  }
  openLookupWindow(selectedText);
});

// 5. Lắng nghe tin nhắn từ Content Script (Nút nổi Bubble AI)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.action === "LOOKUP_WORD") {
    openLookupWindow(message.word || "");
    sendResponse({ success: true });
  }
  return true;
});
