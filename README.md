Copy Better
===========

扩展原生复制功能。

A google chrome extension to make copy better.

[Google Chrome Web Store
Download Link](https://chrome.google.com/webstore/detail/copy-better/hpihdokfdmmghaclaojfpmbckkhjgebc)

Extension functions
===================

本扩展包含以下功能：

* 选中文字自动复制;
* 复制选中内容的HTML源代码;
* 复制当前或者所有标签的标题与地址;
* 保存最近N个拷贝的内容, 可以自由选择;
* 清除网页隐藏文字;

This extension has below functions:
* Copy selected text automatically;
* Copy selected html source code;
* Copy title and URL of current tab or all tabs;
* Store recent copy cache, you can select it from the toolbar button menu;
* Remove hide text in the web when copy;

Extension usage
================
中文说明
--------

1. 安装改扩展后选中文字会自动复制, 如果在选中的情况下按下`Shift`键则会拷贝当前选中内容的HTML源代码。
2. 按下`Ctrl+Y`键以文本格式复制当前标签的标题与地址, 默认的格式为:

    Chrome扩展之增强复制 - http://kodango.com/copybetter-extension

3. 按下`Ctrl+Shift+Y`键以文本格式复制所有标签的标题与地址, 默认的格式为:

    dangoakachan/copybetter - https://github.com/dangoakachan/copybetter
    Chrome扩展之增强复制 - http://kodango.com/copybetter-extension
    扩展程序 - chrome://extensions/

4. 按下`Alt+Y`键以HTML格式复制当前标签的标题与地址，默认的格式为:

    <a href="http://kodango.com/copybetter-extension" title="Chrome扩展之增强复制" target="_blank">Chrome扩展之增强复制</a>

5. 按下`Alt+Shift+Y`键以HTML格式复制所有标签的标题与地址，默认的格式为:

    <a href="https://github.com/dangoakachan/copybetter" title="dangoakachan/copybetter" target="_blank">dangoakachan/copybetter</a>
    <a href="http://kodango.com/copybetter-extension" title="Chrome扩展之增强复制" target="_blank">Chrome扩展之增强复制</a>
    <a href="chrome://extensions/" title="扩展程序" target="_blank">扩展程序</a>

此时, 再次点击工具栏上的图标, 会显示上面复制的内容, 点击列表中的每一项复制。 如果当前在输入框中, 则会自动将选择的内容插入到光标所在的位置。

注意：以上快捷键可以在`chrome://extensions/configureCommands`页面自定义。

English Help
------------

After the extension is installed, it will be copied automatically by default, you can disable this function through the option. If you press `Shift` when select text, then the html source code will be copied instead.

1. Press `Ctrl+Y` will copy the current tab's tile and url
in text format like `%TITLE% - %URL%`. For example, if you visit google.com
now:

    Google - https://www.google.com/

2. Press `Ctrl+Shift+Y` will copy the all tabs' tile and url
in a list of `%TITLE% - %URL%`. For example, if you open google and twitter:

    Google - https://www.google.com/
    Twitter - https://twitter.com/

3. Press `Alt+Y` will copy the current tab's title and url
in html format like `<a href="%URL%" target="_blank">%TITLE%</a>:

    <a href="https://www.google.com/" target="_blank">Google</a>

4. Press `Alt+Shift+Y` will copy all tabs' title and url in a
list of `<a href="%URL%" target="_blank">%TITLE%</a>:

    <a href="https://www.google.com/" title="Google" target="_blank">Google</a>
    <a href="https://twitter.com/" title="Twitter" target="_blank">Twitter</a>

Copy Better extension will remember recent N copy record in cache, you can find
this list through clicking the toolbar icon. Select any copy cache item in the
list will copy it, and if you are in an editbox, it will paste the selected copy
cache item in current cursor position.

Note: You can change the shortcuts as you link in chrome://extensions/configureCommands page.

Extension Settings
==================

Copy selected text in edit box automatically
--------------------------------------------

在编辑框中选中文字时自动复制, 仅当"选中文字时自动复制"选中时才生效

Check this option to automatically copy selected text in an edit box, like text input
or textarea. This option only takes effect when "Copy selected text automatically"
option is checked.

Default: unchecked

Set the text format when copy title and url
----------------------------------------

设置复制标签标题和地址的文本格式

When copy title and url in text format, the format is defined here.

Default: %TITLE%\n%URL%

Set the HTML format when copy title and url
------------------------------------------

设置复制标签标题和地址的HTML格式

When copy title and url in html format, the format is defined here.

Default: `<a href="%URL%" target="_blank">%TITLE%</a>`

Store the copy cache when exit current window
--------------------------------------------

退出当前窗口时保存剪贴版中的缓存内容

Check this option to store copy cache when the window closed.

Default: checked

The maximum number of copy cache item
-------------------------------------

剪贴版中保存的缓存个数

Defines the maximum number of copy cache item saved, value must be between 5 and 500.

Default: 10

Show notification when copy is done
----------------------------------------

当拷贝成功时在窗口右下角显示提示

Show notification in the right-bottom corner when the copy is done successfully.

Default: true
