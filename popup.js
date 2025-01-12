document.addEventListener('DOMContentLoaded', function() {
    const textbox = document.getElementById('textbox');
    const saveBtn = document.getElementById('saveBtn');
    const pasteBtn = document.getElementById('pasteBtn');
  
    // 加载保存的文本
    chrome.storage.local.get(['savedText'], function(result) {
      if (result.savedText) {
        textbox.value = result.savedText;
      }
    });
  
    // 保存按钮点击事件
    saveBtn.addEventListener('click', function() {
      const text = textbox.value;
      chrome.storage.local.set({ savedText: text }, function() {
        alert('Prompt has been buffered to Chrome local storage.');
      });
    });
  
    // 粘贴按钮点击事件
    pasteBtn.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: pasteText,
          args: [textbox.value]
        });
      });
    });
  });
  
  // 在页面中执行的函数
  function pasteText(text) {
    // 补充换行
    text += '\n\n';
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'TEXTAREA' || 
        (activeElement.tagName === 'INPUT' && activeElement.type === 'text')) {
      activeElement.value = text;
    } else {
      const textareas = document.getElementsByTagName('textarea');
      if (textareas.length > 0) {
        textareas[0].value = text;
      } else {
        alert('未找到可输入的文本框！');
      }
    }

    // 模拟键盘输入事件，触发poe的输入
    document.getElementsByTagName('textarea')[0].dispatchEvent(new Event('input', { bubbles: true }));
  }