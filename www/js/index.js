/*
 * on_item contains all items listed for sale.
 * some would expire and some won't
 * each food menu is an item with a long life
 * each ticket entry is an item with an expiry life
 * each gas size is an item with a long life
 * each laundry item is an item with a long life
 * graphics
 * makeup
 * 
 */
 //\
 //||
 /*
 * TODO
 * buyers interface - buy food,...
 * submit reviews
 * process ticket qr allocate and consume
 * increase upload limit
 * process payments...
 * store items locally as indication to avoid null cycling of server
 * onpause send last-seen
 * withdraw from wallet
 * amount due, completed orders, pending orders
 *
 *
 *
 * Do buyers receive alert when delivery charge is set?
 */
 $(document).ready(function() {

    document.addEventListener('deviceready', onDeviceReady, false);
    window.addEventListener('resize', handleResize, false);


    var VERSION = '1.0.0'
    //
    // , MY_URL = "http://localhost/_api"
    // 
    , MY_URL = "http://192.168.43.75/_api"
    //
    // , MY_URL = "http://172.20.10.4/_api"
    //
    // , MY_URL = "http://www.oncampus.ng/_api"
    //
    , BASE_URL = "http://www.oncampus.ng"
    //
    , PLATFORM = 'web'
    , Views = ['#splashView']
    , ChangingView = false
    //
    , VIEWPORTWIDTH = $(window).width()
    , VIEWPORTHEIGHT = $(window).height()
    , SQL = window.openDatabase("OnCampus", "1.0", "user records", 5 * 1024 * 1024)
    , Store = window.localStorage
    , UsernameRegexp = /^[_]{0,2}[a-zA-Z]+[a-zA-Z0-9_]{3,31}$/



    , SPINNER = `<svg class="pull-to-refresh-spinner loaderN" width="32" height="32" viewBox="25 25 50 50">
          <circle class="pull-to-refresh-path" cx="50" cy="50" r="20" fill="none" stroke="#0060ff" stroke-width="4" stroke-miterlimit="10" />
        </svg>`
    , PAGELOADER = '<div class="loaderHolder box48 psa centered fx fx-ac fx-jc">' + SPINNER + '</div>'



    /**/
    , UUID = null
    , EMAIL = null
    , USERNAME = null
    , CAMPUSKEY = 0
    , USERTYPE = 0
    , CATEGORY = 0


    , PHONE = null
    , FULLNAME = null
    , BIRTHDAY = null
    , ADDRESS = null


    , mDrawer = document.querySelector('#side-nav-menu-view')
    , mModal = document.querySelector('#side-nav-modal')
    , mNav = document.querySelector('#side-nav')



    , CURRENT_ORDER = {}
    , ORDER_TOTAL = 0

    , CATEGORIES = ['', 'E-Commerce', 'Food Services', 'Event Tickets', 'Graphics Design', 'Make Up Artist', 'Dry Cleaning', 'Gas Delivery']
    , EVENTS = ['', 'Club Party', 'Pool Party', 'Hangout', 'Concert', 'Movie Ticket', 'House Party', 'Gaming Competition', 'Departmental Party', 'Departmental Dinner']
    , TICKETS = ['', 'Regular', 'Couple', 'VIP', 'VVIP', 'Table for 4', 'Table for 5', 'Table for 6', 'Table for 10']
    , LAUNDRIES = ['', 'Shirt', 'Trouser', 'Jeans', 'Suit', 'Jacket', 'Towel', 'Kaftan', 'Trad', 'Bedsheet', 'Rug', 'Abaya', 'Skirt', 'Socks', 'Singlet', 'Boxer', 'Duvet', 'Blanket', 'Scarf', 'Hoodie', 'Agbada', 'Bag', 'Shoes', 'Jalab']
    , GASES = ['', '3kg Cylinder', '5kg Cylinder', '6kg Cylinder', '12kg Cylinder', '1kg Cylinder']
    , GRAPHICS = ['', 'Logo', 'UI/UX', 'Banner and Flier Design', 'Branding and Corporate Designs', 'Digital Painting', 'Album Art', 'Motion Design']
    , MAKEUPS = ['', 'Craving brows', 'Light makeup', 'Nude makeup', 'Party rocker makeup', 'Bridal Makeup']

    , ACTIVESELECT = null
    , COLORPICKER = null

    , ITEMS_DATA = []




    , BROWSEROPTIONS = 'location=yes,closebuttoncolor=#FE5215,footer=no,hardwareback=no,hidenavigationbuttons=yes,toolbarcolor=#FFFFFF,shouldPauseOnSuspend=yes'
    ;

    /*SQL.transaction(function(i){
        i.executeSql("DROP TABLE IF EXISTS on_user");
    });
    Store.clear();*/


    var App = {
        // LeavingView: false,
        changeViewTo: function(View) {
            // console.log(this.Views);
            if (View === Views[Views.length - 1]/* || document.querySelector(View) == null*/) return; // cannot translate to self
            // if (ChangingView) return; // one ends before stacking another
            // ChangingView = true;
            // var active = $('.active-view').attr('id');
            $('.active-view').removeClass('active-view');
            $(View).addClass('active-view');
            Views.push(View); // current
            // LeavingView = false;
            // ChangingView = false;
            $('body').unspin();
        },
        closeCurrentView: function() {
            var active = Views.pop();
            var previous = Views.pop();
            this.changeViewTo(previous);
        },
        switchTabTo: function(Tab) {
            $('.active-tab').removeClass('active-tab');
            $(Tab).addClass('active-tab');
        }
    }

    function comma(x) {
        var parts = x.toString().split(".");
        if (parts[0].length < 4) return x;
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function handleResize() {
        if ($(window).height() < VIEWPORTHEIGHT * 0.9) $('.hideWhenShrink').addClass('hd');
        else $('.hideWhenShrink').removeClass('hd');
    }

    function onDeviceReady() {

        StatusBar.backgroundColorByHexString('#FE5215');/*add the plugin*/
        document.addEventListener('backbutton', onBackButton, false);
        PLATFORM = cordova.platformId;
        
    }
    
    function onBackButton() {

        if ($('#menuModal').is(':visible')) return $('#menuModal').hide();
        if ($('#side-nav-modal').is(':visible')) return navEnd.call(mNav);
        //
        var activeView = document.querySelector('.active-view').id;
        //
        switch (activeView) {
            case 'signupView':
            case 'channelPrompt':
                return;
                // break;
            case 'landingView':
                var activeTab = document.querySelector('.active-tab').id;
                if (activeTab !== 'timeline') App.switchTabTo('#timeline');
                else if ($('#timeline-content').scrollTop() != 0) $('#timeline-content').scrollTop(0);
                break;
            case 'progress1View':
            case 'progress2View':
                navigator.Backbutton.goHome();
                break;
            default:
                App.closeCurrentView();
        }
    }

    $.fn.extend({
        spin: function(e) {
            if (e) this.html(e);
            else {
                if (this.find('.loaderHolder').length > 0) return this;
                this.append(PAGELOADER);
            }
            return this;
        },
        unspin: function() { this.find('.loaderHolder').remove(); return this; },
        hasID: function(id) { return this.attr('id') == id; },
        disable: function() { this.attr('data-disabled', 'true'); return this; },
        enable: function() { this.attr('data-disabled', 'false'); return this; },
        isDisabled: function() { return this.attr('data-disabled') == 'true'; },
        isLoading: function() { return this.find('.loaderN').length == 1; },
        blink: function() {
            var el = this;
            el.addClass('blink');
            setTimeout(function(){ el.removeClass('blink'); },2000);
            return el;
        },
        flash: function() {
            var el = this;
            el.addClass('flash');
            setTimeout(function(){ el.removeClass('flash'); },400);
            return el;
        },
        scrollToPosition: function(value, callback) {
            var h = this.prop('scrollHeight');
            this.animate({ scrollTop: h - value }, 500, callback);
            return this;
        },
        zoom: function(level) {
            var el = this;
            el.addClass('zoom');
            setTimeout(function(){ el.removeClass('zoom'); }, 300);
            return el;
        },
        countdown: function(callback) {
            var el = this;
            var v = Number(el.text());
            var tokenTime = setInterval(function() {
                --v;
                el.text(v);
                if (v == 0) {
                    callback();
                    clearInterval(tokenTime);
                }
            }, 1000);
            return this;
        },
        showPad: function(sendId) {
            this.html(`
            <div class="fw fx b f20 h40 ba b4-r mg-b"></div>
          <div class="input-6 i-b b4-r psr b ac token-code ba" data-code="1">
            <div class="fw fh fx f20 psa">1</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="2">
            <div class="fw fh fx f20 psa">2</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="3">
            <div class="fw fh fx f20 psa">3</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="4">
            <div class="fw fh fx f20 psa">4</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="5">
            <div class="fw fh fx f20 psa">5</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="6">
            <div class="fw fh fx f20 psa">6</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="7">
            <div class="fw fh fx f20 psa">7</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="8">
            <div class="fw fh fx f20 psa">8</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="9">
            <div class="fw fh fx f20 psa">9</div>
          </div><div class="input-6 i-b b4-r psr b ac token-code Red" data-code="x">
            <div class="fw fh fx f20 psa icon-times"></div>
          </div><div class="input-6 i-b b4-r psr b ac token-code ba" data-code="0">
            <div class="fw fh fx f20 psa">0</div>
          </div><div class="input-6 i-b b4-r psr b ac Theme code-submit" id="${sendId}">
            <div class="fw fh fx f20 psa icon-mark"></div>
          </div>`);
            return this;
        }
    });



    SQL.transaction(function(c) {
        c.executeSql(`CREATE TABLE IF NOT EXISTS on_user
            (id INTEGER PRIMARY KEY AUTOINCREMENT
            , uuid INT NOT NULL
            , email VARCHAR NOT NULL
            , username VARCHAR NOT NULL
            , phone VARCHAR NULL
            , user_type INT NOT NULL
            , channel INT NOT NULL DEFAULT '0'
            , campus_key INT NOT NULL DEFAULT '0'
            , fullname VARCHAR NULL
            , address VARCHAR NULL
            , birthday VARCHAR NULL
            , category INT NOT NULL
            )`,[], s => {
            //category=e-co,food,ticket,gas,graphics,laundry,makeup
                s.executeSql("SELECT * FROM on_user WHERE id = ?", [1], (k, result) => {
                    var len = result.rows.length;
                    if (len > 0) {//data found
                        var r = result.rows.item(0);
                          UUID = r.uuid
                        , EMAIL = r.email
                        , USERNAME = r.username
                        , CAMPUSKEY = r.campus_key
                        , USERTYPE = r.user_type
                        , PHONE = r.phone
                        , FULLNAME = r.fullname
                        , ADDRESS = r.address
                        , CATEGORY = r.category
                        , BIRTHDAY = r.birthday
                        ;
                        loadUserPicture();
                        if (r.channel == 0) showChannelScreen();
                        else preparePage();
                    } else {//no data
                        if (Store.getItem('doneBoarding')) App.changeViewTo('#signupView');
                        else App.changeViewTo('#progress1View');
                    }
                });
            });
    }, function() {/*error*/}, function() {/*success*/});
    function loadUserPicture() {
        var im = new Image();
        im.onload = function() {
            $('.user-display-picture').attr('src', im.src);
        }
        im.onerror = function() {
            $('.user-display-picture').attr('src', '');
        }
        im.src = MY_URL+'/img/users/'+UUID+'.jpg?id='+Date.now();
    }
    function showChannelScreen() {
        App.changeViewTo('#channelPrompt');
    }
    function preparePage() {
        App.changeViewTo('#landingView');
        if (USERTYPE == 0) {//buyer
            $('.forSeller').addClass('hd');
            $('.forBuyer').removeClass('hd');
            fetchEvents('timeline');
            fetchRestaurants('timeline');
        } else if (USERTYPE == 1) {//seller
            $('.forSeller').removeClass('hd');
            $('.forBuyer').addClass('hd');
            // fetchWallet();
            // fetchProgress();
            //
            $('.create-form:not([data-catg="'+CATEGORY+'"])').hide();
            //
            var tx = CATEGORIES[CATEGORY];
            $('#service-name').text(tx);
            //
        }
    }









    











    $('body').on('click', '.view-locator', function () {
        var View = this.dataset.view;
        // console.log(View);
        App.changeViewTo(View);
        
    }).on('click', '#profile-link', function() {
        var el = document.querySelector('#profile-edit-form');
        el.querySelector('input[name="fullname"]').value = FULLNAME;
        if (BIRTHDAY) el.querySelector('input[name="birthday"]').value = BIRTHDAY;
        el.querySelector('input[name="username"]').value = USERNAME;
        el.querySelector('input[name="phone"]').value = PHONE;
        el.querySelector('textarea[name="officeAddress"]').value = ADDRESS;
        App.changeViewTo('#profileEditor');
        //[[continue]]
    }).on('click', '#logoutLink', function() {
        SQL.transaction(function(i){
            i.executeSql("DROP TABLE IF EXISTS on_user");
        });
        Store.clear();
        setTimeout(function() {
            window.location.reload();
        }, 300);
    }).on('mousedown', 'select', function(e) {
        ACTIVESELECT = this;
        e.preventDefault();
        //
        $(':focus').blur();//UI improvement
        //
        var options = this.options;
        var selIdx = this.selectedIndex;
        // toast(typeof options);
        // console.log(options);
        var h = '';
        Array.prototype.slice.call(options).forEach(function(op, i) {
            h += '<div class="fx fx-ac c-g option pd1215 f16 bb" data-index="'+op.index+'" data-selected="'+(selIdx==i)+'">'+op.text+'</div>';
        });
        //
        $('#menuModal').show();
        $('#menuFlexer').html(h).zoom();
        return false;
    }).on('click', '.option', function() {
        var idx = this.dataset.index;
        ACTIVESELECT.selectedIndex = idx;
        if (ACTIVESELECT.id == 'channel-select') {
            if (idx == 0) return;
            $.ajax({
                url: MY_URL + "/send.php",
                data: {
                    action: 'adsChannel',
                    me: UUID,
                    channel: idx
                },
                timeout: 30000,
                dataType: 'json',
                method: "POST",
                success: function(p) {
                    if (p == 1) {
                        preparePage();
                        SQL.transaction(function(i) {
                            i.executeSql("UPDATE on_user SET channel=? WHERE id=?", [idx, 1]);
                        });
                    } else if (p == 0) {
                        toast('Network error. Try again');
                        ACTIVESELECT.selectedIndex = 0;
                    }
                },
                complete: function(x) {
                    if (x.status == 0) {
                        toast('Network error. Try again');
                        ACTIVESELECT.selectedIndex = 0;
                        $('body').unspin();
                    }
                }
            });
        }
    }).on('click', '.color-picker', function() {
        COLORPICKER = this;
        var h=`
        <div id="color-palette" class="pd010 b5 st-p">
            <div id="select-color" class="fx fx-ac pd16 bb" data-index="0">
                <div class="fx60">Select Color</div>
                <div id="color-palette-submit" class="modalClose c-o b">Done</div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="137" data-hex="#FFFFFF">
                <div class="fx60">White</div>
                <div class="box32 i-b ba b-rd" style="background:#FFFFFF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="8" data-hex="#000000">
                <div class="fx60">Black</div>
                <div class="box32 i-b ba b-rd" style="background:#000000;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="114" data-hex="#FF0000">
                <div class="fx60">Red</div>
                <div class="box32 i-b ba b-rd" style="background:#FF0000;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="100" data-hex="#FFA500">
                <div class="fx60">Orange</div>
                <div class="box32 i-b ba b-rd" style="background:#FFA500;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="139" data-hex="#FFFF00">
                <div class="fx60">Yellow</div>
                <div class="box32 i-b ba b-rd" style="background:#FFFF00;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="52" data-hex="#008000">
                <div class="fx60">Green</div>
                <div class="box32 i-b ba b-rd" style="background:#008000;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="10" data-hex="#0000FF">
                <div class="fx60">Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#0000FF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="57" data-hex="#4B0082">
                <div class="fx60">Indigo</div>
                <div class="box32 i-b ba b-rd" style="background:#4B0082;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="135" data-hex="#EE82EE">
                <div class="fx60">Violet</div>
                <div class="box32 i-b ba b-rd" style="background:#EE82EE;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="49" data-hex="#FFD700">
                <div class="fx60">Gold</div>
                <div class="box32 i-b ba b-rd" style="background:#FFD700;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="51" data-hex="#808080">
                <div class="fx60">Gray</div>
                <div class="box32 i-b ba b-rd" style="background:#808080;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="110" data-hex="#FFC0CB">
                <div class="fx60">Pink</div>
                <div class="box32 i-b ba b-rd" style="background:#FFC0CB;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="113" data-hex="#800080">
                <div class="fx60">Purple</div>
                <div class="box32 i-b ba b-rd" style="background:#800080;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="96" data-hex="#000080">
                <div class="fx60">Navy</div>
                <div class="box32 i-b ba b-rd" style="background:#000080;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="123" data-hex="#C0C0C0">
                <div class="fx60">Silver</div>
                <div class="box32 i-b ba b-rd" style="background:#C0C0C0;" ></div>
            </div>

            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="1" data-hex="#F0F8FF">
                <div class="fx60">Alice Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#F0F8FF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="2" data-hex="#FAEBD7">
                <div class="fx60">Antique White</div>
                <div class="box32 i-b ba b-rd" style="background:#FAEBD7;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="3" data-hex="#00FFFF">
                <div class="fx60">Aqua</div>
                <div class="box32 i-b ba b-rd" style="background:#00FFFF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="4" data-hex="#7FFFD4">
                <div class="fx60">Aquamarine</div>
                <div class="box32 i-b ba b-rd" style="background:#7FFFD4;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="5" data-hex="#F0FFFF">
                <div class="fx60">Azure</div>
                <div class="box32 i-b ba b-rd" style="background:#F0FFFF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="6" data-hex="#F5F5DC">
                <div class="fx60">Beige</div>
                <div class="box32 i-b ba b-rd" style="background:#F5F5DC;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="7" data-hex="#FFE4C4">
                <div class="fx60">Bisque</div>
                <div class="box32 i-b ba b-rd" style="background:#FFE4C4;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="9" data-hex="#FFEBCD">
                <div class="fx60">Blanched Almond</div>
                <div class="box32 i-b ba b-rd" style="background:#FFEBCD;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="11" data-hex="#8A2BE2">
                <div class="fx60">Blue Violet</div>
                <div class="box32 i-b ba b-rd" style="background:#8A2BE2;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="12" data-hex="#A52A2A">
                <div class="fx60">Brown</div>
                <div class="box32 i-b ba b-rd" style="background:#A52A2A;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="13" data-hex="#DEB887">
                <div class="fx60">Burly Wood</div>
                <div class="box32 i-b ba b-rd" style="background:#DEB887;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="14" data-hex="#5F9EA0">
                <div class="fx60">Cadet Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#5F9EA0;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="15" data-hex="#7FFF00">
                <div class="fx60">Chartreuse</div>
                <div class="box32 i-b ba b-rd" style="background:#7FFF00;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="16" data-hex="#D2691E">
                <div class="fx60">Chocolate</div>
                <div class="box32 i-b ba b-rd" style="background:#D2691E;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="17" data-hex="#FF7F50">
                <div class="fx60">Coral</div>
                <div class="box32 i-b ba b-rd" style="background:#FF7F50;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="18" data-hex="#6495ED">
                <div class="fx60">Cornflower Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#6495ED;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="19" data-hex="#FFF8DC">
                <div class="fx60">Cornsilk</div>
                <div class="box32 i-b ba b-rd" style="background:#FFF8DC;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="20" data-hex="#DC143C">
                <div class="fx60">Crimson</div>
                <div class="box32 i-b ba b-rd" style="background:#DC143C;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="21" data-hex="#00FFFF">
                <div class="fx60">Cyan</div>
                <div class="box32 i-b ba b-rd" style="background:#00FFFF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="22" data-hex="#00008B">
                <div class="fx60">Dark Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#00008B;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="23" data-hex="#008B8B">
                <div class="fx60">Dark Cyan</div>
                <div class="box32 i-b ba b-rd" style="background:#008B8B;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="24" data-hex="#B8860B">
                <div class="fx60">Dark Goldenrod</div>
                <div class="box32 i-b ba b-rd" style="background:#B8860B;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="25" data-hex="#A9A9A9">
                <div class="fx60">Dark Gray</div>
                <div class="box32 i-b ba b-rd" style="background:#A9A9A9;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="26" data-hex="#006400">
                <div class="fx60">Dark Green</div>
                <div class="box32 i-b ba b-rd" style="background:#006400;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="27" data-hex="#BDB76B">
                <div class="fx60">Dark Khaki</div>
                <div class="box32 i-b ba b-rd" style="background:#BDB76B;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="28" data-hex="#8B008B">
                <div class="fx60">Dark Magenta</div>
                <div class="box32 i-b ba b-rd" style="background:#8B008B;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="29" data-hex="#556B2F">
                <div class="fx60">Dark Olive Green</div>
                <div class="box32 i-b ba b-rd" style="background:#556B2F;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="30" data-hex="#FF8C00">
                <div class="fx60">Dark Orange</div>
                <div class="box32 i-b ba b-rd" style="background:#FF8C00;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="31" data-hex="#9932CC">
                <div class="fx60">Dark Orchid</div>
                <div class="box32 i-b ba b-rd" style="background:#9932CC;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="32" data-hex="#8B0000">
                <div class="fx60">Dark Red</div>
                <div class="box32 i-b ba b-rd" style="background:#8B0000;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="33" data-hex="#E9967A">
                <div class="fx60">Dark Salmon</div>
                <div class="box32 i-b ba b-rd" style="background:#E9967A;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="34" data-hex="#8FBC8F">
                <div class="fx60">Dark Sea Green</div>
                <div class="box32 i-b ba b-rd" style="background:#8FBC8F;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="35" data-hex="#483D8B">
                <div class="fx60">Dark Slate Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#483D8B;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="36" data-hex="#2F4F4F">
                <div class="fx60">Dark Slate Gray</div>
                <div class="box32 i-b ba b-rd" style="background:#2F4F4F;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="37" data-hex="#00CED1">
                <div class="fx60">Dark Turquoise</div>
                <div class="box32 i-b ba b-rd" style="background:#00CED1;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="38" data-hex="#9400D3">
                <div class="fx60">Dark Violet</div>
                <div class="box32 i-b ba b-rd" style="background:#9400D3;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="39" data-hex="#FF1493">
                <div class="fx60">Deep Pink</div>
                <div class="box32 i-b ba b-rd" style="background:#FF1493;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="40" data-hex="#00BFFF">
                <div class="fx60">Deep Sky Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#00BFFF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="41" data-hex="#696969">
                <div class="fx60">Dim Gray</div>
                <div class="box32 i-b ba b-rd" style="background:#696969;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="42" data-hex="#1E90FF">
                <div class="fx60">Dodger Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#1E90FF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="43" data-hex="#B22222">
                <div class="fx60">Fire Brick</div>
                <div class="box32 i-b ba b-rd" style="background:#B22222;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="44" data-hex="#FFFAF0">
                <div class="fx60">Floral White</div>
                <div class="box32 i-b ba b-rd" style="background:#FFFAF0;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="45" data-hex="#228B22">
                <div class="fx60">Forest Green</div>
                <div class="box32 i-b ba b-rd" style="background:#228B22;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="46" data-hex="#FF00FF">
                <div class="fx60">Fuchsia</div>
                <div class="box32 i-b ba b-rd" style="background:#FF00FF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="47" data-hex="#DCDCDC">
                <div class="fx60">Gainsboro</div>
                <div class="box32 i-b ba b-rd" style="background:#DCDCDC;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="48" data-hex="#F8F8FF">
                <div class="fx60">Ghost White</div>
                <div class="box32 i-b ba b-rd" style="background:#F8F8FF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="50" data-hex="#DAA520">
                <div class="fx60">Goldenrod</div>
                <div class="box32 i-b ba b-rd" style="background:#DAA520;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="53" data-hex="#ADFF2F">
                <div class="fx60">Green Yellow</div>
                <div class="box32 i-b ba b-rd" style="background:#ADFF2F;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="54" data-hex="#F0FFF0">
                <div class="fx60">Honey Dew</div>
                <div class="box32 i-b ba b-rd" style="background:#F0FFF0;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="55" data-hex="#FF69B4">
                <div class="fx60">Hot Pink</div>
                <div class="box32 i-b ba b-rd" style="background:#FF69B4;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="56" data-hex="#CD5C5C">
                <div class="fx60">Indian Red</div>
                <div class="box32 i-b ba b-rd" style="background:#CD5C5C;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="58" data-hex="#FFFFF0">
                <div class="fx60">Ivory</div>
                <div class="box32 i-b ba b-rd" style="background:#FFFFF0;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="59" data-hex="#F0E68C">
                <div class="fx60">Khaki</div>
                <div class="box32 i-b ba b-rd" style="background:#F0E68C;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="60" data-hex="#E6E6FA">
                <div class="fx60">Lavender</div>
                <div class="box32 i-b ba b-rd" style="background:#E6E6FA;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="61" data-hex="#FFF0F5">
                <div class="fx60">Lavender Blush</div>
                <div class="box32 i-b ba b-rd" style="background:#FFF0F5;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="62" data-hex="#7CFC00">
                <div class="fx60">Lawn Green</div>
                <div class="box32 i-b ba b-rd" style="background:#7CFC00;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="63" data-hex="#FFFACD">
                <div class="fx60">Lemon Chiffon</div>
                <div class="box32 i-b ba b-rd" style="background:#FFFACD;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="64" data-hex="#ADD8E6">
                <div class="fx60">Light Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#ADD8E6;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="65" data-hex="#F08080">
                <div class="fx60">Light Coral</div>
                <div class="box32 i-b ba b-rd" style="background:#F08080;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="66" data-hex="#E0FFFF">
                <div class="fx60">Light Cyan</div>
                <div class="box32 i-b ba b-rd" style="background:#E0FFFF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="67" data-hex="#FAFAD2">
                <div class="fx60">Light Goldenrod Yellow</div>
                <div class="box32 i-b ba b-rd" style="background:#FAFAD2;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="68" data-hex="#90EE90">
                <div class="fx60">Light Green</div>
                <div class="box32 i-b ba b-rd" style="background:#90EE90;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="69" data-hex="#D3D3D3">
                <div class="fx60">Light Grey</div>
                <div class="box32 i-b ba b-rd" style="background:#D3D3D3;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="70" data-hex="#FFB6C1">
                <div class="fx60">Light Pink</div>
                <div class="box32 i-b ba b-rd" style="background:#FFB6C1;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="71" data-hex="#FFA07A">
                <div class="fx60">Light Salmon</div>
                <div class="box32 i-b ba b-rd" style="background:#FFA07A;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="72" data-hex="#20B2AA">
                <div class="fx60">Light Sea Green</div>
                <div class="box32 i-b ba b-rd" style="background:#20B2AA;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="73" data-hex="#87CEFA">
                <div class="fx60">Light Sky Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#87CEFA;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="74" data-hex="#778899">
                <div class="fx60">Light Slate Gray</div>
                <div class="box32 i-b ba b-rd" style="background:#778899;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="75" data-hex="#B0C4DE">
                <div class="fx60">Light Steel Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#B0C4DE;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="76" data-hex="#FFFFE0">
                <div class="fx60">Light Yellow</div>
                <div class="box32 i-b ba b-rd" style="background:#FFFFE0;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="77" data-hex="#00FF00">
                <div class="fx60">Lime</div>
                <div class="box32 i-b ba b-rd" style="background:#00FF00;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="78" data-hex="#32CD32">
                <div class="fx60">LimeGreen</div>
                <div class="box32 i-b ba b-rd" style="background:#32CD32;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="79" data-hex="#FAF0E6">
                <div class="fx60">Linen</div>
                <div class="box32 i-b ba b-rd" style="background:#FAF0E6;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="80" data-hex="#FF00FF">
                <div class="fx60">Magenta</div>
                <div class="box32 i-b ba b-rd" style="background:#FF00FF;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="81" data-hex="#800000">
                <div class="fx60">Maroon</div>
                <div class="box32 i-b ba b-rd" style="background:#800000;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="82" data-hex="#66CDAA">
                <div class="fx60">Medium Aquamarine</div>
                <div class="box32 i-b ba b-rd" style="background:#66CDAA;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="83" data-hex="#0000CD">
                <div class="fx60">Medium Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#0000CD;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="84" data-hex="#BA55D3">
                <div class="fx60">Medium Orchid</div>
                <div class="box32 i-b ba b-rd" style="background:#BA55D3;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="85" data-hex="#9370DB">
                <div class="fx60">Medium Purple</div>
                <div class="box32 i-b ba b-rd" style="background:#9370DB;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="86" data-hex="#3CB371">
                <div class="fx60">Medium Sea Green</div>
                <div class="box32 i-b ba b-rd" style="background:#3CB371;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="87" data-hex="#7B68EE">
                <div class="fx60">Medium Slate Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#7B68EE;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="88" data-hex="#00FA9A">
                <div class="fx60">Medium Spring Green</div>
                <div class="box32 i-b ba b-rd" style="background:#00FA9A;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="89" data-hex="#48D1CC">
                <div class="fx60">Medium Turquoise</div>
                <div class="box32 i-b ba b-rd" style="background:#48D1CC;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="90" data-hex="#C71585">
                <div class="fx60">Medium Violet Red</div>
                <div class="box32 i-b ba b-rd" style="background:#C71585;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="91" data-hex="#191970">
                <div class="fx60">Midnight Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#191970;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="92" data-hex="#F5FFFA">
                <div class="fx60">Mint Cream</div>
                <div class="box32 i-b ba b-rd" style="background:#F5FFFA;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="93" data-hex="#FFE4E1">
                <div class="fx60">Misty Rose</div>
                <div class="box32 i-b ba b-rd" style="background:#FFE4E1;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="94" data-hex="#FFE4B5">
                <div class="fx60">Moccasin</div>
                <div class="box32 i-b ba b-rd" style="background:#FFE4B5;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="95" data-hex="#FFDEAD">
                <div class="fx60">Navajo White</div>
                <div class="box32 i-b ba b-rd" style="background:#FFDEAD;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="97" data-hex="#FDF5E6">
                <div class="fx60">Old Lace</div>
                <div class="box32 i-b ba b-rd" style="background:#FDF5E6;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="98" data-hex="#808000">
                <div class="fx60">Olive</div>
                <div class="box32 i-b ba b-rd" style="background:#808000;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="99" data-hex="#6B8E23">
                <div class="fx60">Olive Drab</div>
                <div class="box32 i-b ba b-rd" style="background:#6B8E23;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="101" data-hex="#FF4500">
                <div class="fx60">Orange Red</div>
                <div class="box32 i-b ba b-rd" style="background:#FF4500;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="102" data-hex="#DA70D6">
                <div class="fx60">Orchid</div>
                <div class="box32 i-b ba b-rd" style="background:#DA70D6;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="103" data-hex="#EEE8AA">
                <div class="fx60">Pale Goldenrod</div>
                <div class="box32 i-b ba b-rd" style="background:#EEE8AA;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="104" data-hex="#98FB98">
                <div class="fx60">Pale Green</div>
                <div class="box32 i-b ba b-rd" style="background:#98FB98;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="105" data-hex="#AFEEEE">
                <div class="fx60">Pale Turquoise</div>
                <div class="box32 i-b ba b-rd" style="background:#AFEEEE;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="106" data-hex="#DB7093">
                <div class="fx60">Pale Violet Red</div>
                <div class="box32 i-b ba b-rd" style="background:#DB7093;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="107" data-hex="#FFEFD5">
                <div class="fx60">Papaya Whip</div>
                <div class="box32 i-b ba b-rd" style="background:#FFEFD5;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="108" data-hex="#FFDAB9">
                <div class="fx60">Peach Puff</div>
                <div class="box32 i-b ba b-rd" style="background:#FFDAB9;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="109" data-hex="#CD853F">
                <div class="fx60">Peru</div>
                <div class="box32 i-b ba b-rd" style="background:#CD853F;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="111" data-hex="#DDA0DD">
                <div class="fx60">Plum</div>
                <div class="box32 i-b ba b-rd" style="background:#DDA0DD;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="112" data-hex="#B0E0E6">
                <div class="fx60">Powder Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#B0E0E6;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="115" data-hex="#BC8F8F">
                <div class="fx60">Rosy Brown</div>
                <div class="box32 i-b ba b-rd" style="background:#BC8F8F;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="116" data-hex="#4169E1">
                <div class="fx60">Royal Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#4169E1;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="117" data-hex="#8B4513">
                <div class="fx60">Saddle Brown</div>
                <div class="box32 i-b ba b-rd" style="background:#8B4513;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="118" data-hex="#FA8072">
                <div class="fx60">Salmon</div>
                <div class="box32 i-b ba b-rd" style="background:#FA8072;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="119" data-hex="#F4A460">
                <div class="fx60">Sandy Brown</div>
                <div class="box32 i-b ba b-rd" style="background:#F4A460;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="120" data-hex="#2E8B57">
                <div class="fx60">Sea Green</div>
                <div class="box32 i-b ba b-rd" style="background:#2E8B57;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="121" data-hex="#FFF5EE">
                <div class="fx60">Seashell</div>
                <div class="box32 i-b ba b-rd" style="background:#FFF5EE;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="122" data-hex="#A0522D">
                <div class="fx60">Sienna</div>
                <div class="box32 i-b ba b-rd" style="background:#A0522D;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="124" data-hex="#87CEEB">
                <div class="fx60">Sky Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#87CEEB;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="125" data-hex="#6A5ACD">
                <div class="fx60">Slate Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#6A5ACD;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="126" data-hex="#708090">
                <div class="fx60">Slate Gray</div>
                <div class="box32 i-b ba b-rd" style="background:#708090;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="127" data-hex="#FFFAFA">
                <div class="fx60">Snow</div>
                <div class="box32 i-b ba b-rd" style="background:#FFFAFA;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="128" data-hex="#00FF7F">
                <div class="fx60">Spring Green</div>
                <div class="box32 i-b ba b-rd" style="background:#00FF7F;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="129" data-hex="#4682B4">
                <div class="fx60">Steel Blue</div>
                <div class="box32 i-b ba b-rd" style="background:#4682B4;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="130" data-hex="#D2B48C">
                <div class="fx60">Tan</div>
                <div class="box32 i-b ba b-rd" style="background:#D2B48C;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="131" data-hex="#008080">
                <div class="fx60">Teal</div>
                <div class="box32 i-b ba b-rd" style="background:#008080;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="132" data-hex="#D8BFD8">
                <div class="fx60">Thistle</div>
                <div class="box32 i-b ba b-rd" style="background:#D8BFD8;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="133" data-hex="#FF6347">
                <div class="fx60">Tomato</div>
                <div class="box32 i-b ba b-rd" style="background:#FF6347;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="134" data-hex="#40E0D0">
                <div class="fx60">Turquoise</div>
                <div class="box32 i-b ba b-rd" style="background:#40E0D0;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="136" data-hex="#F5DEB3">
                <div class="fx60">Wheat</div>
                <div class="box32 i-b ba b-rd" style="background:#F5DEB3;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="138" data-hex="#F5F5F5">
                <div class="fx60">White Smoke</div>
                <div class="box32 i-b ba b-rd" style="background:#F5F5F5;" ></div>
            </div>
            <div class="radio multipo psr fx fx-ac pd10 bb" data-index="140" data-hex="#9ACD32">
                <div class="fx60">Yellow Green</div>
                <div class="box32 i-b ba b-rd" style="background:#9ACD32;" ></div>
            </div>
        </div>`;
        $('#menuModal').show();
        $('#menuFlexer').html(h).zoom();

        var selectedOptions = [];
        var so = this.dataset.selectedOptions;
        if (so) {
            selectedOptions = so.split(',');
            var $r = $('#color-palette').find('.radio');
            $.each($r, function() {
                if (selectedOptions.indexOf(this.dataset.index) > -1) {
                    var $es = $('#color-palette .radio.selected').last();
                    if (!$es[0]) $es = $('#select-color');
                    $(this).addClass('selected').insertAfter($es);
                }
            });
        }
    }).on('click', '#color-palette .radio', function() {
        var $el = $(this).detach();
        // setTimeout(function() {
            var $es = $('#color-palette .radio.selected').last();
            if (!$es[0]) $es = $('#select-color');
            $el.insertAfter($es);
        // }, 10);
    }).on('click', '#color-palette-submit', function() {
        var o = $('#color-palette').find('.radio.selected'), s = '', h = '';
        if (o.length) {
            var os = [];
            $.each(o, function() {
                os.push(this.dataset.index);
                h+="<div class='box32 mg-rm i-b ba b-rd' style='background:"+this.dataset.hex+";'></div>";
            });
            s = os.join(',');
        }
        COLORPICKER.dataset.selectedOptions = s;
        COLORPICKER.innerHTML = h;
    }).on('click', '#add-item', function() {
        App.changeViewTo('#createView');
        $('.main-wrapper').remove();
        if (CATEGORY == 1) {
            $('.color-picker').html('');
            $('#product-add-form img.im-sh').attr('src','');
        }
        document.querySelector('.create-form[data-catg="'+CATEGORY+'"]').reset();
    }).on('click', '.tab-locator', function() {
        var Tab = this.dataset.tab;
        App.switchTabTo(Tab);
    }).on('click', '.view-closer', function() {
        App.closeCurrentView();
    }).on('click', '.end-onboarding', function() {
        Store.setItem('doneBoarding', 'true');
    }).on('click', '.terms-link', function() {
        cordova.InAppBrowser.open(BASE_URL + '/legal/terms.html', '_blank', BROWSEROPTIONS);
    }).on('click', '.forgot-password', function() {
        
        App.changeViewTo('#retrievalView');

    }).on('click', '.signup-option', function() {

        $(this).addClass('c-o').siblings().removeClass('c-o');
        $('#reg-type').text(this.innerText);
        var ix = this.dataset.index;
        $('form[data-index="'+ix+'"]').show().siblings('form').hide();

    }).on('change', '.images', function(e) {

        var that = this;
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                that.previousElementSibling.src = this.result;
                // that.previousElementSibling.classList.add('fw');
            }
            reader.readAsDataURL(this.files[0]);
            //
            if (this.id == 'profile-picture') {
                var fd = new FormData();
                fd.append('action', 'updateDisplayPix');
                fd.append('displaypix', this.files[0]);
                fd.append('me', UUID);
                //
                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(p) {
                        if (p == '1') {
                            loadUserPicture();
                            toast("Profile picture uploaded successfully");
                        }
                    }
                });
            }
        } else {
            that.previousElementSibling.src = '';
            // that.previousElementSibling.classList.remove('fw');
            // console.log('No file');
        }

    }).on('submit', '.start-form', function(evt) {
        evt.preventDefault();
        if (this.dataset.disabled == 'true') return;

        var el = this;
        var id = el.id;
        var error = null;

        switch (id) {
            case 'signup-form-user':
                var Email = el.querySelector('input[name="email"]').value.toLowerCase();
                var Fullname = el.querySelector('input[name="fullname"]').value;
                var Username = el.querySelector('input[name="username"]').value.toLowerCase().split(' ').join('');
                var Campus = el.querySelector('select[name="institute"]').value;
                var Pass = el.querySelector('input[name="password"]').value;

                //
                if (!Email && !error) error = "<div class='b bb pd10'>Provide your email address</div><div class='pd10'>Your email address is needed to validate your account.</div>";
                if (!Fullname && !error) error = "<div class='b bb pd10'>Full Name is Required</div><div class='pd10'>Your full name is required.</div>";
                if (!UsernameRegexp.test(Username) && !error) error = "<div class='b bb pd10'>Display name error</div><div class='pd10'>Username must be 4 or more characters long and may contain letters, underscore and numbers but cannot start with a number. Special characters and full-stop are not allowed</div>";
                if (Campus == 0 && !error) error = "<div class='b bb pd10'>Please select your institution</div><div class='pd10'>Select your institution to help us serve you nearby items.</div>";
                if ((Pass.length < 8 || Pass.length > 32) && !error) error = "<div class='b bb pd10'>Password not accepted</div><div class='pd10'>Password must be between 8 - 32 characters long.</div>";
                
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';

                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();

                    return;
                }
                el.dataset.disabled = 'true';

                $('body').spin();
                $.ajax({
                    url: MY_URL + "/send.php",
                    data: {
                        action: 'register',
                        email: Email,
                        fullname: Fullname,
                        username: Username,
                        campus: Campus,
                        password: Pass,
                        usertype: '0',
                        platform: PLATFORM
                    },
                    method: "POST",
                    timeout: 30000,
                    dataType: 'json',
                    success: function(p) {
                        if (p.state == 'success') {
                            var data = {
                                  ui: p.ui
                                , un: Username
                                , em: Email
                                , sk: Campus
                                , ut: '0'
                                , ph: null
                                , ma: null
                                , fn: null
                                , ad: null
                                , cg: '0'
                                , ch: '0'
                            };
                            // console.log(data);
                            // store in db and go home
                            toast('Registration Completed Successfully');
                            localizeUserDetails(data, 'signup');
                        } else {
                            if (p.message.indexOf("email") > -1) {
                                toast('Email address not available');
                            } else if (p.message.indexOf("username") > -1) {
                                toast('Username not available');
                            } else toast('An error occurred. Please try again later.');//not expecting this.
                        }
                    },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });

                break;

            case 'signup-form-seller':
                var Email = el.querySelector('input[name="email"]').value.toLowerCase()
                  , Fullname = el.querySelector('input[name="fullname"]').value
                  , Username = el.querySelector('input[name="username"]').value
                  , Address = el.querySelector('textarea[name="officeAddress"]').value
                  , Category = el.querySelector('select[name="category"]').value
                  , Phone = el.querySelector('input[name="phone"]').value
                  , Pass = el.querySelector('input[name="password"]').value
                  , Campus = el.querySelector('select[name="institute"]').value;
                  ;
                
                if (!Fullname && !error) error = "<div class='b bb pd10'>Full Name is Required</div><div class='pd10'>Your full name is required.</div>";
                if (!Username && !error) error = "<div class='b bb pd10'>Display/Brand Name is Required</div><div class='pd10'>Your Display/Brand name would be displayed on your profile.</div>";
                if (!Email && !error) error = "<div class='b bb pd10'>Provide your email address</div><div class='pd10'>Your email address is needed to validate your account.</div>";
                if (!Address && !error) error = "<div class='b bb pd10'>Your Address is Required</div><div class='pd10'>Your address is required for pickup.</div>";
                if (Category == '0' && !error) error = "<div class='b bb pd10'>You must select your business category</div>";
                if (!Phone && !error) error = "<div class='b bb pd10'>Provide your phone number</div><div class='pd10'>Your phone number is required for notifications.</div>";
                if ((Pass.length < 8 || Pass.length > 32) && !error) error = "<div class='b bb pd10'>Password not accepted</div><div class='pd10'>Password must be between 8 - 32 characters long.</div>";
                if (Campus == 0 && !error) error = "<div class='b bb pd10'>Please select your institution</div><div class='pd10'>Select your institution to help us serve your items to nearby buyers.</div>";
                
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';

                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();

                    return;
                }

                el.dataset.disabled = 'true';

                $('body').spin();
                $.ajax({
                    url: MY_URL + "/send.php",
                    data: {
                        action: 'register',
                        email: Email,
                        username: Username,
                        campus: Campus,
                        fullname: Fullname,
                        address: Address,
                        category: Category,
                        phone: Phone,
                        password: Pass,
                        usertype: '1',
                        platform: PLATFORM
                    },
                    method: "POST",
                    timeout: 30000,
                    dataType: 'json',
                    success: function(p) {
                        if (p.state == 'success') {
                            var data = {
                                  ui: p.ui
                                , un: Username
                                , em: Email
                                , sk: '0'
                                , ut: '1'
                                , ph: Phone
                                , fn: Fullname
                                , ad: Address
                                , cg: Category
                                , ch: '0'
                            };
                            // console.log(data);
                            toast('Registration Completed Successfully.');
                            localizeUserDetails(data, 'signup');
                        } else {
                            if (p.message.indexOf("email") > -1) {
                                toast('Email address not available');
                            } else if (p.message.indexOf("username") > -1) {
                                toast('Username not available');
                            } else toast('An error occurred. Please try again.');//maybe key conflict.
                        }
                    },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });

                break;

            case 'login-form':
                var Email = this.querySelector("input[name='emailaddress']").value.toLowerCase();
                var Pass = this.querySelector("input[name='password']").value;
                if (Email && Pass) {
                    //
                    el.dataset.disabled = 'true';
                    $('body').spin();

                    $.ajax({
                        url: MY_URL + "/fetch.php",
                        data: {
                            action: 'login',
                            id: Email,
                            password: Pass,
                            platform: PLATFORM
                        },
                        timeout: 30000,
                        dataType: 'json',
                        method: "GET",
                        success: function(p) {
                            // console.log(JSON.stringify(p));
                            if (p.error) {
                                toast('Incorrect login details');
                            } else {
                                toast('Login Successful');
                                localizeUserDetails(p, 'login');
                            }
                        },
                        error: function() {toast('No connection');},
                        complete: function() { el.dataset.disabled = 'false'; $('body').unspin();}
                    });
                }
                
                break;
            case 'profile-edit-form':
                var Fullname = el.querySelector('input[name="fullname"]').value
                  , Username = el.querySelector('input[name="username"]').value
                  , Birthday = null
                  , Phone = null
                  , Address = null
                  ;
                if (!Fullname && !error) error = "<div class='b bb pd10'>Full Name is Required</div><div class='pd10'>Your full name is required.</div>";
                
                if (USERTYPE == 1) {
                        Phone = el.querySelector('input[name="phone"]').value
                      , Address = el.querySelector('textarea[name="officeAddress"]').value
                      ;
                    if (!Username && !error) error = "<div class='b bb pd10'>Display/Brand Name is Required</div><div class='pd10'>Your Display/Brand name would be displayed on your profile.</div>";
                    if (!Phone && !error) error = "<div class='b bb pd10'>Provide your phone number</div><div class='pd10'>Your phone number is required for notifications.</div>";
                    if (!Address && !error) error = "<div class='b bb pd10'>Your Address is Required</div><div class='pd10'>Your address is required for pickup.</div>";
                } else {
                    Birthday = el.querySelector('input[name="birthday"]').value;
                    if (!UsernameRegexp.test(Username) && !error) error = "<div class='b bb pd10'>Username not available</div><div class='pd10'>Username must be 4 or more characters long and may contain letters, underscore and numbers but cannot start with a number. Special characters and full-stop are not allowed</div>";
                    if (!Birthday && !error) error = "<div class='b bb pd10'>Your Birthday is Required</div><div class='pd10'>Your birthday is required.</div>";
                }
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';

                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();

                    return;
                }

                el.dataset.disabled = 'true';

                $('body').spin();
                //
                // return;
                var fd = new FormData();
                fd.append('action', 'profileUpdate');
                fd.append('userkey', UUID);
                fd.append('usertype', USERTYPE);
                fd.append('fullname', Fullname);
                fd.append('username', Username);
                fd.append('birthday', Birthday);
                fd.append('address', Address);
                fd.append('phone', Phone);

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(p) {
                        // console.log(p);
                        if (p.state == 'success') {
                            toast('Profile updated successfully.');
                            SQL.transaction(function(i) {
                                i.executeSql("UPDATE on_user SET username=?, fullname=?, birthday=?, address=?, phone=? WHERE id=?", [Username, Fullname, Birthday, Address, Phone, 1]);
                            }, function(){}, function() {
                                //
                                  FULLNAME = Fullname
                                , USERNAME = Username
                                , BIRTHDAY = Birthday
                                , ADDRESS = Address
                                , PHONE = Phone
                                ;
                                // App.closeCurrentView();
                            });

                        } else {
                            if (p.message.indexOf('username') > -1) {
                                toast('Username not available');
                            } else toast('An error occurred. Please try again later.');//not expecting this.
                        }
                    },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                //
                break;
            default:
                // break;
        }
    }).on('click', '.password-toggle', function() {
        var handle = this.previousElementSibling;
        if (handle.getAttribute('type') == 'password') {
            handle.setAttribute('type', 'text');
            this.classList.remove('icon-eye');
            this.classList.add('icon-eye-off');
        } else {
            handle.setAttribute('type', 'password');
            this.classList.remove('icon-eye-off');
            this.classList.add('icon-eye');
        }
        handle.focus();
    }).on('click', '#delivery-help', function() {
        var h = `<div class="pd20">
            <b>Delivery options:</b> -these are ways in which logistics of every item sold on our ecommerce platform will be handled.
        To make the process really easy for sellers we provided 3 different options namely:-OnCampus express,OnCampus pick up and deliver ,OnCamus drop and deliver.
        <br>
        <br>
        1. <b>OnCampus express</b> -this stands for express delivery for customers because items registered in this category are stored in our warehouse,sellers wouldn’t have to worry about the item and its delivery
        <br>
        <br>
        2. <b>OnCampus pick up and deliver:</b> -this category the item remains with the seller once there’s an order our delivery personnel comes to pick up from the office address written during registration and delivers to the customer.
        <br>
        <br>
        3. <b>OnCampus drop and deliver:</b> -in this category when a sellers gets an order he/she brings such order to our office and we carry out the delivery 
        <br>
        <br>
        Charges varies on each department and other terms and conditions apply.</div>`;
        $('#menuModal').show();
        $('#menuFlexer').html(h).zoom();
    }).on('click', '.add-more-photos', function() {
        if ($(this).siblings('.product-image').length == 4) return toast("You can only add up to four (4) photos");
        var h = `<div class="product-image main-wrapper fx40 h200 mg-l bg b4-r fx fx-ac fx-jc ov-h ba bg-im-ct psr" style="display:none;">
            <img src="res/img/icon/upload.png">
            <img class="fw psa im-sh" src="">
            <input type="file" accept="image/*" name="images" class="images fw fh psa t0 l0 op0">
            <div class="wrapper-closer box32 f20 psa fx fx-ac Pink c-g b5 b bm-r mg-r mg-t t0 r0 fx-jc z4">&times;</div>
        </div>`;
        $(this).before(h);
        $('.product-image').last().slideDown();
    }).on('submit', '.create-form', function(evt) {
        evt.preventDefault();
        if (this.dataset.disabled == 'true') return;

        var el = this;
        var id = el.id;
        var cg = el.dataset.catg;
        var error = null;

        switch(cg) {
            case '1'://product-add-form
                var Images = el.querySelectorAll('input[name="images"]')
                  , Name = el.querySelector('input[name="name"]').value
                  , ProductCategory = el.querySelector('select[name="product_type"]').value
                  , ProductSize = el.querySelector('select[name="product_size"]').value
                  , ShoeSize = el.querySelector('select[name="shoe_size"]').value
                  , AvailableColors = el.querySelector('.color-picker').dataset.selectedOptions
                  , ProductDelivery = el.querySelector('select[name="product_delivery"]').value
                  , Price = parseInt(el.querySelector('input[name="price"]').value, 10) || 0
                  , Discount = parseInt(el.querySelector('input[name="discount"]').value, 10) || 0
                  , Description = el.querySelector('textarea[name="description"]').value
                  ;
                if (!Name && !error) error = "<div class='b bb pd10'>Please add a Name</div><div class='pd10'>A name is required for item description.</div>";
                if (!ProductCategory && !error) error = "<div class='b bb pd10'>Please select item category</div><div class='pd10'>Select a category for this item.</div>";
                if (!ProductDelivery && !error) error = "<div class='b bb pd10'>Please select delivery option</div><div class='pd10'>Select a delivery option for this item.</div>";
                if (Price === 0 && !error) error = "<div class='b bb pd10'>Please add a Price</div><div class='pd10'>Price should include numbers only.</div>";
                //
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();
                    return;
                }
                var fd = new FormData();
                fd.append('action', 'addECommerceItem');
                fd.append('ownerID', UUID);
                fd.append('name', Name);
                fd.append('productCategory', ProductCategory);
                fd.append('productSize', ProductSize);
                fd.append('shoeSize', ShoeSize);
                fd.append('availableColors', AvailableColors);
                fd.append('productDelivery', ProductDelivery);
                fd.append('price', Price);
                fd.append('discount', Discount);
                fd.append('description', Description);
                var TotalImages = 0;
                Images.forEach(function(el) {
                    if (el.files && el.files[0]) {
                        fd.append('image[]', el.files[0]);
                        TotalImages++;
                    }
                });
                if (TotalImages === 0) return toast('You must add at least 1 photo');
                fd.append('totalImages', TotalImages);
                $('body').spin();
                el.dataset.disabled = 'true';
                //submit package
                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(d) {
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        var p = {
                            productID: d.success,
                            ownerID: UUID,
                            name: Name,
                            price: Price,
                            discount: Discount,
                            delivery: ProductDelivery
                        }
                        buildItems([p], CATEGORY, true);
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            case '2'://food-add-form
                var Image = el.querySelector('input[name="images"]').files
                  , FoodType = el.querySelector('select[name="food_type"]').value
                  , Name = el.querySelector('input[name="name"]').value
                  , Price = parseInt(el.querySelector('input[name="price"]').value, 10)
                  , Discount = el.querySelector('input[name="discount"]').value
                  ;
                if (!Image || !Image[0] || Image[0].size > 2 * 1024 * 1024 && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                if (!FoodType && !error) error = "<div class='b bb pd10'>Please select a type</div><div class='pd10'>Select a type for this item.</div>";
                if (!Name && !error) error = "<div class='b bb pd10'>Please add a Name</div><div class='pd10'>A name is required for meal description.</div>";
                if ((!Price || isNaN(Price)) && !error) error = "<div class='b bb pd10'>Please add a Price</div><div class='pd10'>Price should include numbers only.</div>";
                if (!Discount) Discount = 0;
                //
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();
                    return;
                }
                //
                $('body').spin();
                //submit package
                var fd = new FormData();
                fd.append('action', 'addFoodItem');
                fd.append('ownerID', UUID);
                fd.append('image', Image[0]);
                fd.append('foodType', FoodType);
                fd.append('name', Name);
                fd.append('price', Price);
                fd.append('discount', Discount);

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(d) {
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        var p = {
                            foodID: d.success,
                            ownerID: UUID,
                            food_type: FoodType,
                            name: Name,
                            price: Price,
                            discount: Discount
                        }
                        buildItems([p], CATEGORY, true);
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            case '3'://event-add-form
                var Image = el.querySelector('input[name="images"]').files
                  , Name = el.querySelector('input[name="name"]').value
                  , EventType = el.querySelector('select[name="event_type"]').value
                  , Venue = el.querySelector('textarea[name="venue"]').value

                  , Year = el.querySelector('input[name="year"]').value
                  , Month = el.querySelector('input[name="month"]').value
                  , Day = el.querySelector('input[name="day"]').value
                  , Hour = el.querySelector('input[name="hour"]').value || '00'
                  , Min = el.querySelector('input[name="min"]').value || '00'
                  
                  , AllTickets = []
                  , EventDate = Year + '-' + Month + '-' + Day + ' ' + Hour + ':' + Min
                  ;
                var cgs = el.querySelectorAll('.ticket_category'), localError = false;
                cgs.forEach(function(t) {
                    t.classList.remove('Red');
                    var TicketCatg = t.querySelector('select[name="category"]').value;
                    var Price = parseInt(t.querySelector('input[name="price"]').value, 10) || 0;
                    var Discount = parseInt(t.querySelector('input[name="discount"]').value, 10) || 0;
                    var Seats = parseInt(t.querySelector('input[name="seats"]').value, 10) || 0;
                      ;
                    if (TicketCatg == '0' || Price === 0) {
                        t.classList.add('Red');
                        localError = true;
                        return;
                    }
                    // var entry = [TicketCatg, Price, Discount, Seats];
                    var ticket = {ticket_type: TicketCatg, price: Price, discount: Discount, seats: Seats};
                    // console.log(entry);
                    AllTickets.push(ticket);
                });
                if (localError) return toast('Some entries are not valid');

                if (!Image || !Image[0] || Image[0].size > 2 * 1024 * 1024 && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                if (EventType == '0' && !error) error = "<div class='b bb pd10'>Please select a type</div><div class='pd10'>Select a type for this ticket.</div>";
                if (!Name && !error) error = "<div class='b bb pd10'>Please add a Name</div><div class='pd10'>A name is required to identify this event.</div>";
                if (!Venue && !error) error = "<div class='b bb pd10'>Please add a Venue</div><div class='pd10'>Please state the venue for this event.</div>";
                if (AllTickets.length == 0 && !error) error = "<div class='b bb pd10'>Please add a Ticket</div><div class='pd10'>You must add at least 1 ticket with a complete information.</div>";
                //
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();
                    return;
                }
                $('body').spin();
                //
                var fd = new FormData();
                fd.append('action', 'addEventItem');
                fd.append('ownerID', UUID);
                fd.append('name', Name);
                fd.append('event_date', EventDate);
                fd.append('venue', Venue);
                fd.append('event_type', EventType);//tickets: pool,hangout,club...//[[new]] no mote//regular,VIP...
                fd.append('image', Image[0]);
                fd.append('all_tickets', JSON.stringify(AllTickets));//regular,VIP...//all in one JSON stringified object

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(d) {
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        var p = {
                            ownerID: UUID,
                            eventID: d.success,
                            name: Name,
                            event_type: EventType,
                            event_date: EventDate,
                            venue: Venue,
                            tickets: AllTickets
                        }
                        buildItems([p], CATEGORY, true);
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            case '4'://graphics-add-form
                var Image = el.querySelector('input[name="images"]').files
                  , GraphicsType = el.querySelector('select[name="graphics_type"]').value
                  , Price = parseInt(el.querySelector('input[name="price"]').value, 10) || 0
                  ;
                if (!Image || !Image[0]/* || Image[0].size > 2 * 1024 * 1024*/ && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                if (!GraphicsType && !error) error = "<div class='b bb pd10'>Please select a type</div><div class='pd10'>Select a type for this item.</div>";
                if (Price === 0 && !error) error = "<div class='b bb pd10'>Please add a Price</div><div class='pd10'>Price should include numbers only.</div>";
                //
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();
                    return;
                }
                //
                $('body').spin();
                //submit package
                var fd = new FormData();
                fd.append('action', 'addGraphicsItem');
                fd.append('ownerID', UUID);
                fd.append('image', Image[0]);
                fd.append('graphicsType', GraphicsType);
                fd.append('price', Price);

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(d) {
                        // var d = JSON.parse(d);
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        var p = {
                            graphicsID: d.success,//array
                            ownerID: UUID,
                            graphics_type: GraphicsType,
                            price: Price
                        }
                        buildItems([p], CATEGORY, true);
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            case '5'://makeup-add-form
                var Image = el.querySelector('input[name="images"]').files
                  , MakeupType = el.querySelector('select[name="makeup_type"]').value
                  , Name = el.querySelector('input[name="name"]').value
                  , Price = parseInt(el.querySelector('input[name="price"]').value, 10)
                  ;
                if (!Image || !Image[0] || Image[0].size > 2 * 1024 * 1024 && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                if (MakeupType == '0' && !error) error = "<div class='b bb pd10'>Please select a type</div><div class='pd10'>Select a type for this item.</div>";
                if (!Name && !error) error = "<div class='b bb pd10'>Please add a Name</div><div class='pd10'>A name is required for item description.</div>";
                if ((!Price || isNaN(Price)) && !error) error = "<div class='b bb pd10'>Please add a Price</div><div class='pd10'>Price should include numbers only.</div>";
                //
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();
                    return;
                }
                //
                $('body').spin();
                //submit package
                var fd = new FormData();
                fd.append('action', 'addMakeupItem');
                fd.append('ownerID', UUID);
                fd.append('image', Image[0]);
                fd.append('makeupType', MakeupType);
                fd.append('name', Name);
                fd.append('price', Price);

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(d) {
                        // var d = JSON.parse(d);
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        var p = {
                            makeupID: d.success,//array
                            ownerID: UUID,
                            makeup_type: MakeupType,
                            name: Name,
                            price: Price
                        }
                        buildItems([p], CATEGORY, true);
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            case '6'://laundry-add-form
                var items = [];
                var fms = el.querySelectorAll('.laundry-item'), localError = false;
                fms.forEach(function(fm) {
                    fm.classList.remove('Red');
                    var LaundryType = fm.querySelector('select[name="laundry_type"]').value
                      , Wash = parseInt(fm.querySelector('input[name="wash"]').value, 10) || 0
                      , Iron = parseInt(fm.querySelector('input[name="iron"]').value, 10) || 0
                      , Full = parseInt(fm.querySelector('input[name="full"]').value, 10) || 0
                      ;
                    // if (!Image || !Image[0] || Image[0].size > 2 * 1024 * 1024 && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                    if (!LaundryType && !error) error = "<div class='b bb pd10'>Please select a category</div><div class='pd10'>Select a type for this item.</div>";
                    if (Wash == 0 && Iron == 0 && Full == 0 && !error) error = "<div class='b bb pd10'>Please add a Price</div><div class='pd10'>Add price for at least a category. Price should include numbers only.</div>";
                    //
                    if (error) {
                        if (!localError) {
                            var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                            $('#menuModal').show();
                            $('#menuFlexer').html(h).zoom();
                            fm.classList.add('Red');
                            localError = true;
                            //scroll to fm
                        }
                        return;
                    }
                    items.push({ownerID: UUID, laundry_type: LaundryType, wash: Wash, iron: Iron, full: Full});
                });
                if (localError || items.length === 0) return;// toast('Some entries are not valid');
                //
                $('body').spin();
                //submit package
                var fd = new FormData();
                fd.append('action', 'addLaundryItem');
                fd.append('ownerID', UUID);
                fd.append('laundryData', JSON.stringify(items));

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(d) {
                        // var d = JSON.parse(d);
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        buildItems(items, CATEGORY, true);
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            case '7'://gas-add-form
                var items = [];
                var fms = el.querySelectorAll('.gas-item'), localError = false;
                fms.forEach(function(fm) {
                    fm.classList.remove('Red');
                    var GasType = fm.querySelector('select[name="gas_type"]').value
                      , Price = parseInt(fm.querySelector('input[name="price"]').value, 10) || 0
                      ;
                    if (!GasType && !error) error = "<div class='b bb pd10'>Please select a type</div><div class='pd10'>Select a type for this item.</div>";
                    if (Price === 0 && !error) error = "<div class='b bb pd10'>Please add a Price</div><div class='pd10'>Price should include numbers only.</div>";
                    //
                    if (error) {
                        if (!localError) {
                            var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                            $('#menuModal').show();
                            $('#menuFlexer').html(h).zoom();
                            fm.classList.add('Red');
                            localError = true;
                            //scroll to fm
                        }
                        return;
                    }
                    items.push({ownerID: UUID, gas_type: GasType, price: Price});
                });
                if (localError || items.length === 0) return;// toast('Some entries are not valid');
                //
                $('body').spin();
                //
                var fd = new FormData();
                fd.append('action', 'addGasItem');
                fd.append('ownerID', UUID);
                fd.append('gasData', JSON.stringify(items));

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: fd,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(d) {
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        buildItems(items, CATEGORY, true);
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            
            default:
        }
    }).on('click', '.wrapper-closer', function(e) {
        var $el = $(this).closest('.main-wrapper');
        $el.slideUp(function(){
            $el.remove();
        });
    }).on('click', '#ticket-add', function(e) {
        var h="<div class='fw main-wrapper ticket_category pd10 b4-r mg-b16 Orange white'>\
                <div class='fw f12 mg-b psr b'>ADD ANOTHER TICKET<span class='wrapper-closer psa t-c t0 r0 w32'>x</span></div>\
                <select name='category' class='fw pd20 bg mg-b16 b4-r ba'>\
                    <option value='0'>Select Ticket Type</option>\
                    <option value='1'>Regular</option>\
                    <option value='2'>Couple</option>\
                    <option value='3'>VIP</option>\
                    <option value='4'>VVIP</option>\
                    <option value='5'>Table for 4</option>\
                    <option value='6'>Table for 5</option>\
                    <option value='7'>Table for 6</option>\
                    <option value='8'>Table for 10</option>\
                </select>\
                <input type='number' name='price' class='fw pd20 bg mg-b16 b4-r ba' placeholder='Price'>\
                <input type='number' name='discount' class='fw pd20 bg mg-b16 b4-r ba' placeholder='Add Discount'>\
                <input type='number' name='seats' class='fw pd20 bg b4-r ba' placeholder='Available Seats'>\
            </div>";
        $(this).before(h);
    }).on('click', '#laundry-add', function(e) {
        var h=`<div class="laundry-item main-wrapper mg-b16 pd16 Grey b4-r">
            <div class='fw f12 mg-b psr b'>ADD ANOTHER ITEM<span class='wrapper-closer psa t-c t0 r0 w32'>x</span></div>
            <div class="triangle-down mg-b16"><select name="laundry_type" class="fw pd20 bg b4-r ba">
                <option value="">Select Type</option>
                <option value="1">Shirt</option>
                <option value="2">Trouser</option>
                <option value="3">Jeans</option>
                <option value="4">Suit</option>
                <option value="5">Jacket</option>
                <option value="6">Towel</option>
                <option value="7">Kaftan</option>
                <option value="8">Trad</option>
                <option value="9">Bedsheet</option>
                <option value="10">Rug</option>
                <option value="11">Abaya</option>
                <option value="12">Skirt</option>
                <option value="13">Socks</option>
                <option value="14">Singlets</option>
                <option value="15">Boxer</option>
                <option value="16">Duvet</option>
                <option value="17">Blanket</option>
                <option value="18">Scarf</option>
                <option value="19">Hoodie</option>
                <option value="20">Agbada</option>
                <option value="21">Bag</option>
                <option value="22">Shoes</option>
                <option value="23">Jalab</option>
            </select></div>
            <input type="number" name="wash" class="fw pd20 bg b4-r ba" placeholder="Price for Wash only">
            <input type="number" name="iron" class="fw pd20 bg b4-r ba" placeholder="Price for Iron only">
            <input type="number" name="full" class="fw pd20 bg b4-r ba" placeholder="Price for Full laundry">
        </div>`;
        $(this).before(h);
    }).on('click','#gas-add',function(){
        var h=`<div class="gas-item main-wrapper pd16 mg-b16 Grey b4-r">
            <div class='fw f12 mg-b psr b'>ADD ANOTHER ITEM<span class='wrapper-closer psa t-c t0 r0 w32'>x</span></div>
            <div class="triangle-down mg-b16"><select name="gas_type" class="fw pd20 bg b4-r ba">
                <option value="">Select Cylinder Size</option>
                <option value="1">3kg</option>
                <option value="2">5kg</option>
                <option value="3">6kg</option>
                <option value="4">12kg</option>
                <option value="5">1kg</option>
            </select></div>
            <input type="number" name="price" class="fw pd20 bg b4-r ba" placeholder="Price">
        </div>`;
        $(this).before(h);
    }).on('click','.singo',function(){
        $(this).addClass('selected').siblings().removeClass('selected');
    }).on('click','.multipo',function(){
        this.classList.toggle('selected');
    }).on('click', '.menu-btn', function(e) {
        $(this).addClass('active').siblings('.active').removeClass('active');
        // change tabs appropriately
    }).on('click', '.meal-type', function() {
        var idx = this.dataset.index;
        $('#meal-container').animate({'left': '-'+(idx*100)+'vw'});
    }).on('touchstart click', '.st-p', function(e) {
        // e.preventDefault();
        e.stopPropagation();
    }).on('click', '.Modal', function() {
        $(this).hide();
    }).on('click', '.modalClose', function() {
        $('#menuModal').hide();
    }).on('touchmove', '.Modal', function(e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
    }).on('click', '#menu-button', function() {
        mDrawer.style.transition = 'transform 200ms ease-out';
        mDrawer.style.transform = 'translate3d(0, 0, 0)';
        mDrawer.classList.add('sh-l');
        mModal.style.display = 'block';
    }).on('click', '#myItemsLink, .shop-link', function() {
        App.changeViewTo('#itemsView');
        $('.items-container').hide();

        var catg, shopId, shopName, shopAddress, $v;
        if (this.id == 'myItemsLink') {//owner's item.
            catg = CATEGORY;
            shopId = UUID;
            shopName = USERNAME;
            shopAddress = ADDRESS;
            $('#proceed-to-cart').hide();
        } else {//highlighted items
            catg = this.dataset.catg;
            shopId = this.dataset.shopId;
            shopName = this.dataset.shopName;
            shopAddress = this.dataset.shopAddress;
            $('#proceed-to-cart').show().attr('data-catg', catg);
        }

        var img = new Image();
        img.onload = function() {
            $('#shop-banner').css('backgroundImage', 'url('+img.src+')');
        }
        img.src = MY_URL+'/img/users/'+shopId+'.jpg?id=1';
        
        $('#display-name').text(shopName);
        $('#user-address').text(shopAddress);
        $('.items-container[data-catg="'+catg+'"]').show();
        
        $('body').spin();
        $.ajax({
            url: MY_URL + "/fetch.php",
            data: {
                action: 'fetchItems',
                shopID: shopId,
                catg: catg
            },
            dataType: 'json',
            timeout: 30000,
            method: "GET",
            success: function(p) {
                if (p.length > 0) {
                    buildItems(p, catg, false);
                } else {
                    //
                }
            },
            complete: function() {$('body').unspin();}
        });
        //
    }).on('click', '.item-remove', function(e) {
        console.log('Will delete: ' + this.dataset.itemId);
        // [[continue]]
    }).on('click', '.item-order-spinner', function(e) {
        var id = e.target.classList;
        var counter = this.querySelector('.item-count');
        var count = Number(counter.innerText);
        if (id.contains('item-subtract')) {
            if (count == 0) return;
            counter.innerText = --count;
        } else if (id.contains('item-add')) {
            counter.innerText = ++count;
        }
    }).on('click', '#proceed-to-cart', function(e) {
        // if ($(this).isDisabled()) return toast('You have not selected any items');
        var catg = this.dataset.catg;
        var menu = document.querySelector('.items-container[data-catg="'+catg+'"]');
        var orders = [];
        switch(catg) {
            case '1'://e-commerce
                break;
            case '2'://food
                var items = menu.querySelectorAll('.item-count');// console.log(items.length);
                items.forEach(function(item) {
                    var tt = item.innerText; if (tt == 0) return;// console.log(tt);
                    var id = item.dataset.itemId;
                    var d = ITEMS_DATA.find(function(a) {return a.foodID == id;});
                    if (d) {
                        orders.push({id: id, nm: d.name, pr: parseFloat(d.price).toFixed(2), ds: parseFloat(d.discount).toFixed(2), tt: tt});
                    }
                });
                break;
            case '3'://events//[[***]]
                break;
            case '4'://graphics
                break;
            case '5'://makeup
                break;
            case '6'://laundry
                break;
            case '7'://gas
                break;
        }



        if (orders[0]) {
            CURRENT_ORDER = orders;
            App.changeViewTo('#invoiceView');
            $('#invoice-content').html(buildInvoice(orders, catg));//[[continue]]
        } else toast('No item was selected');
    }).on('click', '#proceed-to-address', function(e) {//on invoice-view
        App.changeViewTo('#dropoffView');
        var fm = document.querySelector('#dropoff-content');
        fm.querySelector('input[name="address"]').value = Store.getItem('delivery_address');
        fm.querySelector('input[name="name"]').value = Store.getItem('delivery_name');
        fm.querySelector('input[name="phone"]').value = Store.getItem('delivery_phone');
    }).on('click', '#submit-for-review', function(e) {
        var fm = document.querySelector('#dropoff-content');
        var address = fm.querySelector('input[name="address"]').value;
        var name = fm.querySelector('input[name="name"]').value;
        var phone = fm.querySelector('input[name="phone"]').value;
        var forr = fm.querySelector('select[name="order_for"]').value;
        var deliveryInstruction = fm.querySelector('textarea[name="deliveryInstruction"]').value;
        var voucherCode = document.querySelector('input[name="voucherCode"]').value;
        //
        if (!address || !name || !phone || !forr) return toast('Provide all required fields');
        //
        var details = {ad: address, nm: name, ph: phone, fr: forr, dv: deliveryInstruction};
        //
        $('body').spin();
        $.ajax({
            url: MY_URL + "/send.php",
            data: {
                action: 'createOrder',
                cost: ORDER_TOTAL,
                invoice: JSON.stringify(CURRENT_ORDER),
                details: JSON.stringify(details),
                voucher: voucherCode,
                sellerID: ITEMS_DATA[0].ownerID,
                buyerID: UUID
            },
            method: "POST",
            timeout: 30000,
            dataType: 'json',
            success: function(p) {
                if (p.error) {
                    //pop at cart entry
                    //keep track at localStorage to make polling easier
                } else {
                    toast(p.success);
                    console.log(p.success);
                    //notify failure
                }
            },
            complete: function() {
               //
            }
        });
        // App.changeViewTo('#cardView');
    }).on('click', '.pin-key', function(e) {
        var pin = $('#card-pin');
        var val = pin.attr('data-value');
        var key = this.innerText;
        if (key == 'x') pin.html('').attr('data-value', '');
        else pin.html(pin.html() + '*').attr('data-value', val + key);
    }).on('click', '#make-payment', function(e) {
        var el = document.querySelector('#card-content');
        var cardNumber = el.querySelector('input[name="cardNumber"]').value;
        var cardMonth = el.querySelector('select[name="cardMonth"]').value;
        var cardYear = el.querySelector('select[name="cardYear"]').value;
        var cardCVV = el.querySelector('input[name="cardCVV"]').value;
        var PIN = $('#card-pin').attr('data-value');
        //
        // send payment information. [[continue]]
    })
    ;











    var D = { X: 0, Y: 0, Z: 0 }, VIEW80 = -VIEWPORTWIDTH * 0.80;
    $('#drawer-listener').on('touchstart', function(e) {
        mDrawer.style.transition = '';
        var e = e.originalEvent || e, touch = e.touches[0];
        if (e.touches.length > 1) return;
        if (touch) {
            D.Z = VIEW80, D.X = touch.pageX, D.Y = touch.pageY;
            this.addEventListener('touchmove', touchmove);
            this.addEventListener('touchend', touchend);
        }
    });
    function touchmove(e) {
        var e = e.originalEvent || e, touch = e.touches[0];
        if (touch.pageX - D.X > Math.abs(touch.pageY - D.Y)) {
            if (touch.pageX - D.X <= 0) return this.removeEventListener('touchmove', touchmove);
            if (e.cancelable) e.preventDefault(); //direction > 1 => pulling, disallow native scrolling
            var distance = touch.pageX - D.X, p = Math.min(VIEW80 + 0.8 * distance, 0);
            mDrawer.classList.add('sh-l');
            mDrawer.style.transform = 'translate3d(' + p + 'px, 0, 0)';
            D.Z = p;
        } else if (D.Z == VIEW80) return this.removeEventListener('touchmove', touchmove);
    }
    function touchend(e) {
        this.removeEventListener('touchmove', touchmove);
        this.removeEventListener('touchend', touchend);
        if (D.Z > -150) {
            mDrawer.style.transform = 'translate3d(0, 0, 0)';
            mModal.style.display = 'block';
        } else {
            mDrawer.style.transform = 'translate3d(-105%, 0, 0)';
            mDrawer.classList.remove('sh-l');
            mModal.style.display = 'none';
        }
        mDrawer.style.transition = 'all 200ms ease-out';
    }

    var nav = { x: 0, y: 0, z: 0 }
    mNav.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        // e = e.originalEvent || e;
        mDrawer.style.transition = '';
        var touch = e.touches[0];
        nav.x = touch.pageX, nav.y = touch.pageY, nav.z = 0;
        this.addEventListener('touchmove', navMove);
        this.addEventListener('touchend', navEnd);
    });
    function navMove(e) {
         // e = e.originalEvent || e, 
        var touch = e.touches[0];
        var distance = touch.pageX - nav.x, p = Math.min(distance * 0.8, 1);
        if (Math.abs(touch.pageY - nav.y) > Math.abs(distance)) return this.removeEventListener('touchmove', navMove); // user scrolling vertically
        if (e.cancelable) e.preventDefault();
        mDrawer.style.transform = 'translate3d(' + p + 'px, 0, 0)';
        nav.z = p;
    }
    function navEnd(e) {
        this.removeEventListener('touchmove', navMove);
        this.removeEventListener('touchend', navEnd);
        // if (e.target.id == 'side-nav-modal') e.preventDefault();
        if (e.target == mModal) e.preventDefault();
        // console.log(nav.z);
        if (nav.z > -150 && nav.z !== 0) {//not down to -150
            mDrawer.style.transform = 'translate3d(0, 0, 0)';
            mModal.style.display = 'block';
        } else {
            mDrawer.style.transform = 'translate3d(-105%, 0, 0)';
            mDrawer.classList.remove('sh-l');
            mModal.style.display = 'none';
        }
        mDrawer.style.transition = 'all 200ms ease-in';
    }

 





    function fetchEvents(source) {//timeline, search,
        $.ajax({
            url: MY_URL + "/fetch.php",
            data: {
                action: 'fetchEvents',
                campus: CAMPUSKEY,
                // catg: '3',
                shopID: UUID
            },
            timeout: 30000,
            dataType: 'json',
            method: "GET",
            success: function(p) {
                // console.log(p);
                if (p.length == 0) return;
                if (source == 'timeline') {
                    $('#carousel-buy-ticket').html(buildEvents(p));
                }
            },
            complete: function() {$('body').unspin();}
        });
    }
    function fetchRestaurants(source) {//timeline, search,
        $.ajax({
            url: MY_URL + "/fetch.php",
            data: {
                action: 'fetchRestaurants',
                campus: CAMPUSKEY,
                // catg: '2',
                shopID: UUID
            },
            timeout: 30000,
            dataType: 'json',
            method: "GET",
            success: function(p) {
                // console.log(p);
                if (p.length == 0) return;
                if (source == 'timeline') {
                    $('#carousel-buy-food').html(buildRestaurants(p));
                }
            },
            complete: function() {$('body').unspin();}
        });
    }
    function buildEvents(p) {//[[continue]]
        var h = '';
        p.forEach(function(c) {
            h+="<div class='w85p-c i-b ov-h mg-r sh-a ba psr bs-r shop-link"
                    +"' data-shop-id='"+c.ui
                    +"' data-shop-name='"+c.sn
                    +"' data-shop-address='"+c.sd
                    +"' data-catg='3'>\
                    <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                        <img src='"+MY_URL+"/img/items/events/"+c.id+".jpg' class='fw'>\
                    </div>\
                    <div class='fw psa tx-sh white caption lh-i b0 l0 pd10'>\
                        <div class='fw b f16'>"+c.nm+"</div>\
                        <div class='fw b f16 c-o'>"+EVENTS[c.tp]+"</div>\
                        <div class='fw b c-o'>"+c.dt+"</div>\
                        <div class='fw f10'>"+c.ad+"</div>\
                    </div>\
                </div>";
        });
        h+="<div class='w85p-c i-b ov-h mg-r sh-a ba psr bs-r more-services' data-catg='3'>\
                <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                    <img src='res/img/icon/party.jpg' class='fw'>\
                </div>\
                <div class='fw psa tx-sh white caption lh-i b0 l0 pd10'>\
                    <div class='fw b f14'>More...</div>\
                    <div class='fw ovx-h ovy-a f10'>Browse events</div>\
                </div>\
            </div>";
        return (h);
    }
    function buildRestaurants(p) {
        var h = '';
        p.forEach(function(c) {
            h+="<div class='w85p-c i-b ov-h mg-r sh-a ba psr bs-r shop-link"
                    +"' data-shop-id='"+c.ui
                    +"' data-catg='"+c.cg
                    +"' data-sub='"+c.tp
                    +"' data-shop-name='"+c.nm
                    +"' data-shop-address='"+c.ad
                    +"'>\
                    <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                        <img src='"+MY_URL+"/img/users/"+c.ui+".jpg' class='fw'>\
                    </div>\
                    <div class='fw psa tx-sh white caption lh-i b0 l0 pd10'>\
                        <div class='fw b f16'>"+c.nm+"</div>\
                        <div class='fw ovx-h ovy-a f10'>"+c.ad+"</div>\
                    </div>\
                </div>";
        });
        h+="<div class='w85p-c i-b ov-h mg-r sh-a ba psr bs-r more-services' data-catg='2'>\
                <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                    <img src='res/img/icon/food.jpg' class='fw'>\
                </div>\
                <div class='fw psa tx-sh white caption lh-i b0 l0 pd10'>\
                    <div class='fw b f14'>More...</div>\
                    <div class='fw ovx-h ovy-a f10'>Browse restaurants</div>\
                </div>\
            </div>";
        return (h);
        //
    }
    function buildItems(p, catg, local) {
        var h = '';
        var user = p[0].ownerID == UUID;

        if (catg == '1') {//e-commerce
            p.forEach(function(c) {
                h+="<div class='boxes2 product-entry i-b bg' data-product-id='"+c.productID+"'>\
                    <div class='fw'>\
                        <div class='fw fx h50w bg-ac mg-b bs-r ba ov-h'>\
                            <img class='fw im-sh' src='"+MY_URL+"/img/items/products/"+c.productID+"_0.jpg'>\
                        </div>\
                        <div class='fw'>\
                            <div class='f16 b'>"+c.name+"</div>"+
                            (c.discount > 0 ? "<span class='tx-lt ltt c-g f10 mg-r'>&#8358;"+comma(c.price)+"</span>" : "")+
                            "<span class='f16'>&#8358;"+comma((c.price - c.discount).toFixed(2))+"</span>\
                        </div>"+
                        (c.delivery == 1 ? 
                        "<div class='fx f10'>\
                            <div style='width:54px;'><img src='res/img/logo.png' class='fw'></div><i class='b'>Express</i>\
                        </div>":
                        ""
                        )+
                    "</div>\
                </div>";
            });
            var $v = $('#products-container');
            if (local) $v.append(h); else $v.html(h);
        } else if (catg == '2') {//food
            var h1="", h2="", h3="", h4="";
            ITEMS_DATA = p;
            p.forEach(function(c) {
                var m="<div class='fw food-entry bg pd16 mg-tx sh-c' data-type='"+c.food_type+"'>\
                    <div class='fw fx fx-fs'>\
                        <div class='w120 xh120 bg-ac bs-r ov-h'><img src='"+MY_URL+"/img/items/food/"+c.foodID+".jpg' class='fw bs-r'></div>\
                        <div class='fx60 mg-lx'>\
                            <div class='f16 b'>"+c.name+"</div>\
                            <div class='fw fx fx-fe mg-t'>\
                                <div class='fx50'>"
                                    +(c.discount > 0 ? "<div class='tx-lt c-g f10'>&#8358;"+comma(c.price)+"</div>" : "")+
                                    "<div class='f16'>&#8358;"+comma((c.price - c.discount).toFixed(2))+"</div>\
                                </div>"+
                                (user ? 
                                "<div class='fx fx-je c-g'>\
                                    <!--<div class='item-edit f20 mg-rxx icon-edit' data-item-id='"+c.foodID+"'></div>-->\
                                    <div class='item-remove f20 icon-logout' data-item-id='"+c.foodID+"'></div>\
                                </div>":
                                "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.foodID+"'>\
                                    <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-subtract'>-</div>\
                                    <div class='fx fx-ac fx-jc w32 item-count t-c' data-item-key='"+c.pk+"' data-item-id='"+c.foodID+"'>0</div>\
                                    <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-add'>+</div>\
                                </div>"
                                )+
                            "</div>\
                        </div>\
                    </div>\
                </div>";
                switch(c.food_type){
                    case'1':case 1:h1+=m;break;
                    case'2':case 2:h2+=m;break;
                    case'3':case 3:h3+=m;break;
                    case'4':case 4:h4+=m;break;
                }
            });
            var $v = $('#meal-container');
            if (local) {
                if (h1) $v.find('[data-menu="1"]').append(h1);
                if (h2) $v.find('[data-menu="2"]').append(h2);
                if (h3) $v.find('[data-menu="3"]').append(h3);
                if (h4) $v.find('[data-menu="4"]').append(h4);
                //let's swipe to the meal type container
                var idx = p[0].food_type - 1;
                $('.menu-btn[data-index="'+idx+'"]').click();
            } else {
                $v.find('[data-menu="1"]').html(h1);
                $v.find('[data-menu="2"]').html(h2);
                $v.find('[data-menu="3"]').html(h3);
                $v.find('[data-menu="4"]').html(h4);
            }
        } else if (catg == '3') {//ticket
            p.forEach(function(c) {
                h+="<div class='fw event-entry psr'>\
                        <div class='fw fx fx-ac pd1015 caption white psa t0 l0'>\
                            <div class='fx60'>\
                                <div class='f20 b'>"+c.name+"</div>\
                                <div class='f12'>"+EVENTS[c.event_type]+"</div>\
                                <div class='f12'>"+c.event_date+"</div>\
                            </div>\
                        </div>"+
                        (user ? "<div class='item-delete psa pd5 Grey bs-r mg-t mg-r ba r0 ac' data-item-id='"+c.eventID+"' data-catg='3'>Remove Event</div>":"")+
                        "<img class='fw fx sh-a' src='"+MY_URL+"/img/items/events/"+c.eventID+".jpg'>";
                c.tickets.forEach(function(v) {
                    h+="<div class='fw pd16 mg-bx sh-c'>\
                        <div class='fw fx fx-fs'>\
                            <div class='fx60'>\
                                <div class='f16 b'>"+TICKETS[v.ticket_type]+"</div>\
                                <div class='fw fx fx-fe mg-t'>\
                                    <div class='fx50'>"
                                        +(v.discount > 0 ? "<div class='tx-lt c-g f10'>&#8358;"+comma(v.price)+"</div>" : "")+
                                        "<div class='f16'>&#8358;"+comma((v.price - v.discount).toFixed(2))+"</div>\
                                    </div>"+
                                    (user ? 
                                    "":
                                    "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.eventID+"'>\
                                        <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-subtract'>-</div>\
                                        <div class='fx fx-ac fx-jc w32 item-count t-c"
                                            +"' data-item-id='"+c.eventID
                                            +"' data-item-name='"+TICKETS[v.ticket_type]
                                            +"' data-item-price='"+v.price
                                            +"' data-item-discount='"+v.discount
                                            +"'>0</div>\
                                        <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-add'>+</div>\
                                    </div>"
                                    )+
                                "</div>\
                            </div>\
                        </div>\
                    </div>";
                });
                h+='</div>';
            });
            var $v = $('#events-container');
            if (local) $v.append(h); else $v.html(h);
        } else if (catg == '4') {//graphics
            p.forEach(function(c) {
                h+="<div class='fw graphics-entry bg pd16 mg-tx sh-c'>\
                    <div class='fw fx fx-fs'>\
                        <div class='w120 xh120 bg-ac bs-r ov-h'><img src='"+MY_URL+"/img/items/graphics/"+c.graphicsID+".jpg' class='fw bs-r'></div>\
                        <div class='fx60 mg-lx'>\
                            <div class='f16 b'>"+GRAPHICS[c.graphics_type]+"</div>\
                            <div class='fw fx fx-fe'>\
                                <div class='fx50'>\
                                    <div class='f16'>&#8358;"+comma(parseFloat(c.price).toFixed(2))+"</div>\
                                </div>"+
                                (user ? 
                                "<div class='fx fx-je c-g'>\
                                    <!--<div class='item-edit f20 mg-rxx icon-edit' data-item-id='"+c.graphicsID+"'></div>-->\
                                    <div class='item-remove f20 icon-logout' data-item-id='"+c.graphicsID+"'></div>\
                                </div>":
                                "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.graphicsID+"'>\
                                    <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-subtract'>-</div>\
                                    <div class='fx fx-ac fx-jc w32 item-count t-c"
                                        +"' data-item-id='"+c.graphicsID
                                        +"' data-item-name='"+GRAPHICS[c.graphics_type].replace("'", '&apos;')
                                        +"' data-item-price='"+c.price
                                        +"'>0</div>\
                                    <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-add'>+</div>\
                                </div>"
                                )+
                            "</div>\
                        </div>\
                    </div>\
                </div>";
            });
            var $v = $('#graphics-container');
            if (local) $v.append(h); else $v.html(h);
        } else if (catg == '5') {//make up
            p.forEach(function(c) {
                h+="<div class='fw makeup-entry bg pd16 mg-tx sh-c'>\
                    <div class='fw fx fx-fs'>\
                        <div class='w120 xh120 bg-ac bs-r ov-h'><img src='"+MY_URL+"/img/items/makeup/"+c.makeupID+".jpg' class='fw bs-r'></div>\
                        <div class='fx60 mg-lx'>\
                                <div class='f16 b'>"+MAKEUPS[c.makeup_type]+"</div>\
                                <div class='b5'>"+c.name+"</div>\
                            </div>\
                            <div class='fw fx fx-fe mg-t'>\
                                <div class='fx50'>\
                                    <div class='f16'>&#8358;"+comma(c.price)+"</div>\
                                </div>"+
                                (user ? 
                                "<div class='fx fx-je c-g'>\
                                    <!--<div class='item-edit f20 mg-rxx icon-edit' data-item-id='"+c.makeupID+"'></div>-->\
                                    <div class='item-remove f20 icon-logout' data-item-id='"+c.makeupID+"'></div>\
                                </div>":
                                "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.makeupID+"'>\
                                    <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-subtract'>-</div>\
                                    <div class='fx fx-ac fx-jc w32 item-count t-c"
                                        +"' data-item-id='"+c.makeupID
                                        +"' data-item-name='"+c.name.replace("'", '&apos;')
                                        +"' data-item-price='"+c.price
                                        +"'>0</div>\
                                    <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-add'>+</div>\
                                </div>"
                                )+
                            "</div>\
                        </div>\
                    </div>\
                </div>";
            });
            var $v = $('#makeup-container');
            if (local) $v.append(h); else $v.html(h);
        } else if (catg == '6') {//laundry
            p.forEach(function(c) {
                h+="<div class='fw laundry-entry bg pd16 mg-tx sh-c'>\
                    <div class='fw fx'>\
                        <div class='fx60 f16 b'>"+LAUNDRIES[c.laundry_type]+"</div>\
                        <div class='fx fx-fe mg-t'>"+
                            (user ? 
                            "<div class='fx fx-je c-g'>\
                                <div class='item-remove f20 icon-logout' data-item-id='"+c.laundry_type+"'></div>\
                            </div>":
                            "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.laundry_type+"'>\
                                <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-subtract'>-</div>\
                                <div class='fx fx-ac fx-jc w32 item-count t-c"
                                    +"' data-item-id='"+c.laundry_type
                                    +"' data-item-name='"+LAUNDRIES[c.laundry_type].replace("'", '&apos;')
                                    +"'>0</div>\
                                <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-add'>+</div>\
                            </div>"
                            )+
                        "</div>\
                    </div>\
                    <div class='fw b5 laundry-type' data-item-id='"+c.laundry_type+"'>"+
                        (c.full > 0 ? "<div class='radio"+(user ? '' : ' singo selected')+" psr mg-bx' data-name='full'>&#8358;"+c.full+" (Full laundry)</div>" : "")+
                        (c.wash > 0 ? "<div class='radio"+(user ? '' : ' singo')+" psr mg-bx"+(c.full == 0 && !user ? ' selected' : '')+"' data-name='wash'>&#8358;"+c.wash+" (Wash only)</div>" : "")+
                        (c.iron > 0 ? "<div class='radio"+(user ? '' : ' singo')+" psr mg-bx"+(c.full == 0 && c.wash == 0 && !user ? 'selected' : '')+"' data-name='iron'>&#8358;"+c.iron+" (Iron only)</div>" : "")+
                    "</div>\
                </div>";
            });
            var $v = $('#laundry-container');
            if (local) $v.append(h); else $v.html(h);
        } else if (catg == '7') {//gas
            p.forEach(function(c) {
                h+="<div class='fw gas-entry bg pd16 mg-tx sh-c'>\
                    <div class='fw fx'>\
                        <div class='fx60'>\
                            <div class='f16 b'>"+GASES[c.gas_type]+"</div>\
                            <div class='b5'>&#8358;"+comma(c.price)+"</div>\
                        </div>\
                        <div class='fx fx-fe mg-t'>"+
                            (user ? 
                            "<div class='fx fx-je c-g'>\
                                <div class='item-remove f20 icon-logout' data-item-id='"+c.gas_type+"'></div>\
                            </div>":
                            "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.gas_type+"'>\
                                <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-subtract'>-</div>\
                                <div class='fx fx-ac fx-jc w32 item-count t-c"
                                    +"' data-item-id='"+c.gas_type
                                    +"' data-item-name='"+GASES[c.gas_type].replace("'", '&apos;')
                                    +"'>0</div>\
                                <div class='fx fx-ac fx-jc Orange white b2-r box20 f20 item-add'>+</div>\
                            </div>"
                            )+
                        "</div>\
                    </div>\
                </div>";
            });
            var $v = $('#gas-container');
            if (local) $v.append(h); else $v.html(h);
        }
    }
    function buildInvoice(p) {
        var h = '';
        var total = 0;
        p.forEach(function(c) {
            var price = (c.pr - c.ds) * c.tt;
            total += price;
            h+="<div class='fw fx pd1015'>\
                    <span class='b c-o mg-r'>"+c.tt+"x</span>\
                    <span class='b fx60 mg-r'>"+c.nm+"</span>\
                    <span class=''>&#8358;"+comma(price)+"</span>\
                </div>";
        });
        ORDER_TOTAL = total;
        h+="<div class='fw pd30'><input type='text' name='voucherCode' class='fw pd16 bg-ac t-c b4-r ba' placeholder='Enter Voucher Code'></div>\
            <div class='fw fx b bt bb pd16'><span class='fx60'>Total</span><span class=''>&#8358;"+comma(ORDER_TOTAL)+"</span></div>";
        return h;
    }
    function localizeUserDetails(p, action) {
        SQL.transaction(function(i) {
            i.executeSql(
                "INSERT INTO on_user(id,uuid,email,username,campus_key,user_type,fullname,address,category,phone,channel) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [1, p.ui, p.em, p.un, p.sk, p.ut, p.fn, p.ad, p.cg, p.ph, p.ch]
            );
        }, function(e){console.log(e.code);console.log(e.message);}, function() {
              UUID = p.ui
            , EMAIL = p.em
            , USERNAME = p.un
            , FULLNAME = p.fn
            , PHONE = p.ph
            , CAMPUSKEY = p.sk
            , USERTYPE = p.ut
            , ADDRESS = p.ad
            , CATEGORY = p.cg
            ;
            if (action == 'signup' || p.ch == 0) showChannelScreen();
            else {
                preparePage();
                loadUserPicture();
            }
        });
    }

    var TST = null;
    var $tst = $('#toast-container');
    function toast(message) {
        clearTimeout(TST);
        $tst.stop()
            .html('<div class="b bg-mod pd1015 bs-r t-c f14 white" style="background-color:rgba(0, 0, 0, 0.8);">' + message + '</div>')
            .css('opacity', 1).removeClass('hd');
        
        TST = setTimeout(function() {
            $tst.animate({opacity: 0}, 1000, function(){
                $tst.addClass('hd');
            });
        }, 3000);
    }

});