// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "pasteStoredText",
      title: "Feed Prompt",
      contexts: ["action"]  // 这表示只在扩展图标的右键菜单中显示
    });
  });
  
  // 处理右键菜单点击事件
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "pasteStoredText") {
      // 获取存储的文本
      chrome.storage.local.get(['savedText'], function(result) {
        if (result.savedText) {
          // 将文本粘贴到当前页面
          chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: pasteText,
            args: [result.savedText]
          });
        } else {
          // 如果没有保存的文本，显示通知
          chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: () => {
              alert('没有找到已保存的文本！');
            }
          });
        }
      });
    }
  });
  
  // 粘贴文本的函数
  function pasteText(text) {
    const activeElement = document.activeElement;
    
    // 检查当前焦点元素是否是可输入的元素
    if (activeElement.tagName === 'TEXTAREA' || 
        (activeElement.tagName === 'INPUT' && 
         (activeElement.type === 'text' || activeElement.type === 'search'))) {
      activeElement.value = text;
      // 触发input事件
      const event = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(event);
      return;
    }
  
    // 如果没有焦点元素，查找页面中的文本框
    const textareas = document.getElementsByTagName('textarea');
    const inputs = document.getElementsByTagName('input');
    
    // 首先尝试textarea
    if (textareas.length > 0) {
      textareas[0].value = text;
      textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    
    // 然后尝试文本输入框
    for (let input of inputs) {
      if (input.type === 'text' || input.type === 'search') {
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }
  
    // 如果都没找到，显示提示
    alert('未找到可输入的文本框！');
  }