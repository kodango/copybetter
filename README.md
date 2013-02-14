Copy Better
===========

扩展原生复制功能。

A google chrome extension to make copy better.

Extension functions
===================

本扩展包含以下功能：

* 选中文字自动复制;
* 复制选中内容的HTML源代码;
* 复制页面标题与URL地址;
* 保存最近N个拷贝的内容, 可以自由选择;

This extension has below functions:
* Copy selected text automatically;
* Copy selected html source code;
* Copy current page's title and URL;
* Store recent copy cache, you can select it from the toolbar button menu;

Extension usage
================
中文说明
--------

当你开启"选中文字自动复制"选项后, 选中文字会自动复制, 如果在选中的情况下按下shift+c则会拷贝当前选中内容的HTML源代码。

未选中任何文字时, 按下ctrl+c键以文本格式复制文章的标题与地址, 默认的格式为:

  Chrome扩展之增强复制功能 - http://kodango.com/copy-extension

未选中文字时，按下shift+c键以HTML格式复制文章的标题与地址，默认的格式为:

  <a href="http://kodango.com/copy-extension" target="_blank">Chrome扩展之增强复制功能</a>

此时, 再次点击工具栏上的图标, 会显示上面复制的内容, 点击列表中的每一项复制, 如果当前在输入框中, 则会自动将选择的内容插入到光标所在的位置。

English Help
------------

If you select the text, it will be copied automatically by default, you can
disale this function through the option. If you press shift+c when select text,
then the html source code will be copied instead.

If you select nothing, press ctrl+c will copy the current page's tile and url
in text format like `%TITLE% - %URL%`. For example, if you visit google.com
now:

    Google - https://www.google.com/

If you select nothing, press shift+c will copy the current page's title and url
in html format like `<a href="%URL%" target="_blank">%TITLE%</a>. So visit
google.com again, this time will give a different result:

    <a href="https://www.google.com/" target="_blank">Google</a>

Copy Better extension will remember recent N copy record in cache, you can find
this list through clicking the toolbar icon. Select any copy cache item in the
list will copy it, and if you are in an editbox, it will paste the selected copy
cache item in current cursor position.

Extension Settings
==================

Copy selected text automatically
--------------------------------
 
选中文字时自动复制

Check this option to automatically copy selected text.

Default: checked

Copy selected text in edit box automatically
--------------------------------------------

在编辑框中选中文字时自动复制

Check this option to automatically copy selected text in an edit box, like text
input or textarea.

Default: unchecked

Copy title and url (text format, Ctrl+c)
----------------------------------------

未选中任何文字时，按下ctrl+c键以文本格式复制文章的标题与地址

Use ctrl+c to copy title and url in text format, the format is defined here. 

Default: %TITLE%\n%URL%

Copy title and url (html format, Shift+c)
------------------------------------------

未选中文字时，按下shift+c键以HTML格式复制文章的标题与地址

Use shift+c to copy title and url in html format, the format is defined here.

Default: `<a href="%URL%" target="_blank">%TITLE%</a>`
	
tore the copy cache when exit current window
--------------------------------------------

退出当前窗口时保存剪贴版中的缓存内容

Check this option to store copy cache when the window closed.

Default: checked

The maximum number of copy cache item
-------------------------------------

剪贴版中保存的缓存个数

Defines the maximum number of copy cache item saved.

Default: 10

Only display first n chars of copy cache item in the popup window
-----------------------------------------------------------------

弹出窗口中仅显示复制缓存项内容的前n个字符

Only display first n chars of copy cache item in the popup window opened when click the toolbar button.

Default: 40
