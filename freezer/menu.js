var _menus = new Hashtable();

function _menuOnMouseOver(e, menuId) { return _menuOnMouseMovement(e, menuId, true); }
function _menuOnMouseOut(e, menuId) { return _menuOnMouseMovement(e, menuId, false); }

function _menuOnMouseMovement(e, menuId, over) {
  var targ = getEventTarget(e);

  if (targ) {
    var menu = _menus.get(menuId);
    if (menu) {
      if (targ != menu.get('selectedItem')) {
        targ.className = menu.get(over ? 'classHover' : 'classNormal');
      }
    }
  }
  return true;
}

function _menuOnClick(e, menuId) {
  var targ = getEventTarget(e);
  menuClick(targ, menuId);
}

function menuClick(targ, menuId) {
  if (targ) {
    var menu = _menus.get(menuId);
    if (menu) {
      if (targ != menu.get('selectedItem')) {
        var fn = menu.get('callback');
        if (fn != null) {
          if (fn.call(null, targ, targ.getAttribute('id'), menuId, targ.getAttribute('href'))) { return; }
        }

        var selectedItem = menu.get('selectedItem');
        if (selectedItem) selectedItem.className = menu.get('classNormal');
        targ.className = menu.get('classSelected');
        menu.put('selectedItem', targ);

        if (menu.get('clearAllOthers') == true) {
          var arrKeys = _menus.keys();
          var i;
          for (i in arrKeys) {
            if (arrKeys[i] != menuId) {
              clearSelected(arrKeys[i]);
            }
          }
        }
        return true;
      }
    }
  }
  return false;
}

function addMenu(menuId, tagName, classNormal, classSelected, classHover, clearAllOthers, callback) {
  var newMenu = document.getElementById(menuId);
  if (newMenu) {
    var menuData = new Hashtable();
    menuData.put('selectedItem', null);
    menuData.put('tagName', tagName);
    menuData.put('classNormal', classNormal);
    menuData.put('classSelected', classSelected);
    menuData.put('classHover', classHover);
    menuData.put('clearAllOthers', clearAllOthers);
    menuData.put('callback', callback);

    var menuItems = newMenu.getElementsByTagName(tagName);
    var menuItemLen = menuItems.length;
    var i;
    for (i = 0; i < menuItemLen; i++) {
      var menuItem = menuItems[i];
      var menuHref = menuItem.getAttribute('href');
      if (menuHref) {
        menuItem.onmouseover = makeEventHandlerWithArg(_menuOnMouseOver, menuId);
        menuItem.onmouseout = makeEventHandlerWithArg(_menuOnMouseOut, menuId);
        menuItem.onclick = makeEventHandlerWithArg(_menuOnClick, menuId);

        if (menuItem.className == classSelected) {
          menuData.put('selectedItem', menuItem);
        }
      }
    }
    _menus.put(menuId, menuData);
  }

}

function addMenuItem(menuId, menuItem) {
  var menuHref = menuItem.getAttribute('href');
  if (menuHref) {
    menuItem.onmouseover = makeEventHandlerWithArg(_menuOnMouseOver, menuId);
    menuItem.onmouseout = makeEventHandlerWithArg(_menuOnMouseOut, menuId);
    menuItem.onclick = makeEventHandlerWithArg(_menuOnClick, menuId);
  }
}

function removeMenuItem(menuItem) {
  var menuHref = menuItem.getAttribute('href');
  if (menuHref) {
    menuItem.onmouseover = null;
    menuItem.onmouseout = null;
    menuItem.onclick = null;
  }
}

function removeMenu(menuId) {
  _menus.remove(menuId);
}

function clearSelected(menuId) {
  var menu = _menus.get(menuId);
  if (menu) {
    var menuToClear = document.getElementById(menuId);
    var menuItems = menuToClear.getElementsByTagName(menu.get('tagName'));
    var menuItemLen = menuItems.length;
    for (i = 0; i < menuItemLen; i++) {
      var menuItem = menuItems[i];
      var menuHref = menuItem.getAttribute('href');
      if (menuHref) {
        menuItem.className = menu.get('classNormal');
      }
    }
    menu.put('selectedItem', null);
  }
}
