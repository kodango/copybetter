/*
 * Allow copy in the page
 */

(function() {
    /* The events to be cleaned */
    var events = ['contextmenu', 'selectstart'];

    /*
     * Inject the css into page
     */
     function injectCss(style)
     {
         var ele = document.createElement('style');

         ele.type = 'text/css';
         ele.appendChild(document.createTextNode(style));

         document.body.appendChild(ele);
     }

     /*
      * A fake handler
      */
     function fakeHandler(event)
     {
         return true;
     }

     /*
      * Clean the specified event binded to the element
      */
     function doClean(ele, event_type)
     {
         event_type = 'on' + event_type;

         if (ele.getAttribute && ele.getAttribute(event_type)) {
             ele.setAttribute(event_type, fakeHandler);
         }
     }

     /*
      * Clean handler
      */
     function cleanHandler(event)
     {
         var el = event.target;

         event.stopPropagation();

         // Clean the element and its ancestors
         while (el) {
             doClean(el, event.type);
             el = el.parentNode;
         }
     }

     /* The main entry */
     function main()
     {
         var i, len = events.length;

         // Disable user-select restriction in css
         injectCss("* {-webkit-user-select: text;}");

         // Clean all the binded events which disables the copy
         for (i = 0; i < len; i++) {
             doClean(document, events[i]);
             document.addEventListener(events[i], cleanHandler, true);
         }
     }

     main();
})();
