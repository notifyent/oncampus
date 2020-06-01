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
 $(document).ready(function() {

    document.addEventListener('deviceready', onDeviceReady, false);
    window.addEventListener('resize', handleResize, false);


    var VERSION = '1.0.0'
    //
    // , MY_URL = "http://localhost/oncampus/api"
    // , RES_URL = "http://localhost/oncampus/api/chat"
    // 
    , MY_URL = "http://192.168.43.75/oncampus/api"
    // , RES_URL = "http://192.168.43.75/oncampus/api/chat"
    //
    // , MY_URL = "http://172.20.10.4/oncampus/api"
    // , RES_URL = "http://172.20.10.4/oncampus/api/chat"
    //
    , BASE_URL = "http://localhost/oncampus"
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
    , PAGELOADER = '<div class="loaderHolder box48 ps-a centered fx fx-ac fx-jc">' + SPINNER + '</div>'



    /**/
    , UUID = null
    , EMAIL = null
    , USERNAME = null
    , CAMPUSKEY = 0
    , USERTYPE = 0
    , MAIN_CATEGORY = 0
    , SUB_CATEGORY = 0



    , PHONE = null
    , FULLNAME = null
    , ADDRESS = null


    , mDrawer = document.querySelector('#side-nav-menu-view')
    , mModal = document.querySelector('#side-nav-modal')
    , mNav = document.querySelector('#side-nav')



    , ORDER = {}
    , ORDER_DESTINATION = {}
    , ORDER_TOTAL = 0
    , ORDER_CHARGES = 0

    , MAIN_CATEGORIES = ['', 'E-Commerce', 'Food Services', 'Ticketing', 'General Services']
    , GENERAL_SERVICES = ['', 'Graphics Design', 'Make Up Artist', 'Dry Cleaning', 'Gas']
    , EVENTS = ['', 'Club Party', 'Pool Party', 'Hangout', 'Concert', 'Movie Ticket', 'House Party', 'Gaming Competition', 'Departmental Party', 'Departmental Dinner']
    , TICKETS = ['', 'Regular', 'Couple', 'VIP', 'VVIP', 'Table for 4', 'Table for 5', 'Table for 6', 'Table for 10']




    , INAPPBROWSEROPTIONS = 'location=yes,closebuttoncolor=#FE5215,footer=no,hardwareback=no,hidenavigationbuttons=yes,toolbarcolor=#FFFFFF,shouldPauseOnSuspend=yes'
    ;
    //

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
        },
        closeCurrentView: function() {
            // if (LeavingView) return; [[???]]
            // LeavingView = true;
            var active = Views.pop();
            var previous = Views.pop();
            this.changeViewTo(previous);
        },
        switchTabTo: function(Tab) {
            $('.active-tab').removeClass('active-tab');
            $(Tab).addClass('active-tab');
        }
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
            , campus_key INT NOT NULL DEFAULT '0'
            , fullname VARCHAR NULL
            , address VARCHAR NULL
            , main_category INT NOT NULL
            , subcategory INT NOT NULL
            )`,[], s => {
            //category=food,ticket,general
            //subcategory=gas,graphics,laundry,makeup
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
                        , MAIN_CATEGORY = r.main_category
                        , SUB_CATEGORY = r.subcategory
                        ;
                        preparePage();
                    } else {//no data
                        if (Store.getItem('doneBoarding')) App.changeViewTo('#signupView');
                        else App.changeViewTo('#progress1View');
                    }
                });
            });
    }, function() {/*error*/}, function() {/*success*/});
    function preparePage() {
        //move all these to successful login
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
            $('.create-form:not([data-catg="'+MAIN_CATEGORY+'"])').hide();
            //
            var tx = '';
            if (MAIN_CATEGORY == '4') tx = GENERAL_SERVICES[SUB_CATEGORY];
            else tx = MAIN_CATEGORIES[MAIN_CATEGORY];
            $('#service-name').text(tx);
            //
        }
    }









    











    $('body').on('click', '.view-locator', function () {
        var View = this.dataset.view;
        // console.log(View);
        switch(View) {
            case '#profileEditor':
                if (USERTYPE == 1) $('.sellerInput').show();
                else $('.sellerInput').hide();
                break;
            default:
        }
        App.changeViewTo(View);
        
    }).on('click', '#myItemsLink, .shop-link', function() {//[[continue]]
        App.changeViewTo('#itemsView');
        $('.items-view-category').hide();

        var catg, sub, shopId, shopName, shopAddress, folder, $v;
        if (this.id == 'myItemsLink') {//owner's item.
            catg = MAIN_CATEGORY;
            sub = SUB_CATEGORY;
            shopId = UUID;
            shopName = USERNAME;
            shopAddress = ADDRESS;
            // folder = 'users';
        } else {//highlighted items
            catg = this.dataset.catg;
            sub = this.dataset.sub;
            shopId = this.dataset.shopId;
            shopName = this.dataset.shopName;
            shopAddress = this.dataset.shopAddress;
        }
        if (catg == '2') folder = 'users';//food, others may join [[watch]]
        else folder = 'items';
        //if catg == '3' //no banner.[[continue]]
        //
        if (catg == '4') {
            $('.items-view-category[data-sub="'+sub+'"]').show();
            //more to come???
        } else {
            $v = $('.items-view-category[data-catg="'+catg+'"]');
            $v.show();
            $v.find('.shop-banner').css('backgroundImage', 'url('+MY_URL+'/img/'+folder+'/'+shopId+'.jpg)');
            $v.find('.display-name').text(shopName);
            if (catg == '3') $v.find('.event-type').text(EVENTS[this.dataset.eventType]);
            $v.find('.user-address').text(shopAddress);
        }
        $('body').spin();
        $.ajax({
            url: MY_URL + "/fetch.php",
            data: {
                action: 'fetchItems',
                shopID: shopId,
                catg: catg,
                sub: sub
            },
            timeout: 30000,
            dataType: 'json',
            method: "GET",
            success: function(p) {
                if (p.length > 0) {
                    buildItems(p, true, false);
                    //if catg=='3' && user//change name venue etc.[[continue]]
                } else {
                    if (catg == '3') {//events
                        $v.find('.shop-banner').css('backgroundImage', 'url('+MY_URL+'/img/users/'+shopId+'.jpg)');
                    }
                }
            },
            complete: function() {$('body').unspin();}
        });
        //
    }).on('click', '#addFoodItem', function() {//[[continue]]
    }).on('click', '.add-item', function() {
        var catg = this.dataset.catg;
        //[[continue]]
        $('.image-preview').attr('src', 'res/img/icon/upload.png');
        App.changeViewTo('#createView');
    }).on('click', '.tab-locator', function() {
        var Tab = this.dataset.tab;
        App.switchTabTo(Tab);
    }).on('click', '.view-closer', function() {
        App.closeCurrentView();
    }).on('click', '.end-onboarding', function() {
        Store.setItem('doneBoarding', 'true');
    }).on('click', '.terms-link', function() {
        cordova.InAppBrowser.open(BASE_URL + '/legal/terms.html', '_blank', INAPPBROWSEROPTIONS);
    }).on('click', '.forgot-password', function() {
        
        App.changeViewTo('#retrievalView');

    }).on('click', '.signup-option', function() {

        $(this).addClass('c-o').siblings().removeClass('c-o');
        $('#reg-type').text(this.innerText);
        var ix = this.dataset.index;
        $('form[data-index="'+ix+'"]').show().siblings('form').hide();

    }).on('change', '#category-select', function() {
        
        if (this.value == '4') $('#services-select').show();
        else $('#services-select').hide();

    }).on('change', '.images', function(e) {

        var that = this;
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                // $('#create-image-preview').attr('src', this.result).addClass('fw');
                that.previousElementSibling.src = this.result;
                that.previousElementSibling.classList.add('fw');
            }
            reader.readAsDataURL(this.files[0]);
        } else {
            that.previousElementSibling.src = 'res/img/icon/upload.png';
            that.previousElementSibling.classList.remove('fw');

            // $('#create-image-preview').attr('src', 'res/img/icon/upload.png').removeClass('fw');
            // console.log('No file');
        }

    }).on('submit', '.start-form', function(evt) {
        evt.preventDefault();
        if (this.dataset.disabled == 'true') return;

        var el = this;
        var id = el.id;
        var error = null;

        switch (id) {
            case 'signup-form':
                var Email = el.querySelector('input[name="email"]').value.toLowerCase();
                var Fullname = el.querySelector('input[name="fullname"]').value;
                var Username = el.querySelector('input[name="username"]').value.toLowerCase().split(' ').join('');
                var Campus = el.querySelector('select[name="institute"]').value;
                var Pass = el.querySelector('input[name="password"]').value;

                //
                if (!Email && !error) error = "<div class='b bb pd10'>Provide your email address</div><div class='pd10'>Your email address is needed to validate your account.</div>";
                if (!Fullname && !error) error = "<div class='b bb pd10'>Full Name is Required</div><div class='pd10'>Your full name is required.</div>";
                if (!UsernameRegexp.test(Username) && !error) error = "<div class='b bb pd10'>Username not available</div><div class='pd10'>Username must be 4 or more characters long and may contain letters, underscore and numbers but cannot start with a number. Special characters and full-stop are not allowed</div>";
                if (Campus == 0 && !error) error = "<div class='b bb pd10'>Please select your institution</div><div class='pd10'>Select your institution to help us serve you nearby items.</div>";
                if ((Pass.length < 8 || Pass.length > 32) && !error) error = "<div class='b bb pd10'>Password not accepted</div><div class='pd10'>Password must be between 8 - 32 characters long.</div>";
                
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';

                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();

                    return;
                }

                // var type = $('.signup-option.c-o').attr('data-index');
                el.dataset.disabled = 'true';

                // var payLoad = '';

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
                                , sb: '0'
                            };
                            // console.log(data);
                            // store in db and go home
                            localizeUserDetails(data, 'signup');
                            // toast('Registration Completed Successfully.');
                        } else {
                            if (p.message.indexOf("email") > -1) {
                                toast('Email address not available.');
                            } else if (p.message.indexOf("username") > -1) {
                                toast('Username not available.');
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
                  , Category = el.querySelector('#category-select').value
                  , SubCategory = el.querySelector('#services-select').value
                  , Phone = el.querySelector('input[name="phone"]').value
                  , Pass = el.querySelector('input[name="password"]').value
                  , Campus = el.querySelector('select[name="institute"]').value;
                  ;
                
                if (!Email && !error) error = "<div class='b bb pd10'>Provide your email address</div><div class='pd10'>Your email address is needed to validate your account.</div>";
                if (!Fullname && !error) error = "<div class='b bb pd10'>Full Name is Required</div><div class='pd10'>Your full name is required.</div>";
                if (!Username && !error) error = "<div class='b bb pd10'>Display/Brand Name is Required</div><div class='pd10'>Your Display/Brand name would be displayed on your profile.</div>";
                if (!Address && !error) error = "<div class='b bb pd10'>Your Address is Required</div><div class='pd10'>Your address is required for pickup.</div>";
                if (Category == '0' && !error) error = "<div class='b bb pd10'>You must select your business category</div>";
                if (Category == '4' && SubCategory == '0' && !error) error = "<div class='b bb pd10'>You must select your service type</div>";
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
                        subcategory: SubCategory,
                        phone: Phone,
                        password: Pass,
                        usertype: '1',
                        platform: PLATFORM
                    },
                    method: "POST",
                    timeout: 30000,
                    // cache: false,
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
                                , sb: SubCategory
                            };
                            // console.log(data);
                            // store in db and go home
                            localizeUserDetails(data, 'signup');
                            // toast('Registration Completed Successfully.');
                        } else {
                            if (p.message.indexOf("email") > -1) {
                                toast('Email address not available.');
                            } else if (p.message.indexOf("username") > -1) {
                                toast('Username not available.');
                            } else toast('An error occurred. Please try again later.');//not expecting this.
                        }
                    },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });

                break;

            case 'login-form':
                var Email = this.querySelector("input[name='emailormobile']").value.toLowerCase();
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
                                localizeUserDetails(p, 'login');
                            }
                        },
                        complete: function() { el.dataset.disabled = 'false'; $('body').unspin();}
                    });
                }
                
                break;
            case 'profile-edit-form'://[[continue]]
                var Fullname = el.querySelector('input[name="fullname"]').value
                  , Username = el.querySelector('input[name="username"]').value
                  , Address = null
                  , Phone = null
                  ;
                if (!Fullname && !error) error = "<div class='b bb pd10'>Full Name is Required</div><div class='pd10'>Your full name is required.</div>";
                if (!Username && !error) error = "<div class='b bb pd10'>Display/Brand Name is Required</div><div class='pd10'>Your Display/Brand name would be displayed on your profile.</div>";
                
                if (USERTYPE == 1) {
                    var Phone = el.querySelector('input[name="phone"]').value
                      , Address = el.querySelector('textarea[name="officeAddress"]').value
                      ;
                    if (!UsernameRegexp.test(Username) && !error) error = "<div class='b bb pd10'>Username not available</div><div class='pd10'>Username must be 4 or more characters long and may contain letters, underscore and numbers but cannot start with a number. Special characters and full-stop are not allowed</div>";
                    if (!Phone && !error) error = "<div class='b bb pd10'>Provide your phone number</div><div class='pd10'>Your phone number is required for notifications.</div>";
                    if (!Address && !error) error = "<div class='b bb pd10'>Your Address is Required</div><div class='pd10'>Your address is required for pickup.</div>";
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
                return;

                $.ajax({
                    url: MY_URL + "/send.php",
                    data: {
                        action: 'update',
                        usertype: USERTYPE,
                        fullname: Fullname,
                        username: Username,
                        address: Address,
                        phone: Phone
                    },
                    method: "POST",
                    timeout: 30000,
                    dataType: 'json',
                    success: function(p) {
                        if (p.state == 'success') {
                            // console.log(p);
                            SQL.transaction(function(i) {
                                i.executeSql("UPDATE on_user SET username=?, fullname=?, phone=? WHERE id=?", [Username, Fullname, Phone, 1]);
                            }, function(){}, function() {
                                //
                                  FULLNAME = Fullname
                                , USERNAME = Username
                                , PHONE = Phone
                                ;
                                App.closeCurrentView();
                            });

                        } else {
                            if (p.message.indexOf('username') > -1) {
                                toast('Username not available.');
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
    }).on('submit', '.create-form', function(evt) {
        evt.preventDefault();
        if (this.dataset.disabled == 'true') return;

        var el = this;
        var id = el.id;
        var error = null;

        switch(id) {
            case 'food-add-form':
                var Image = el.querySelector('input[name="images"]').files
                  , ItemType = el.querySelector('select[name="item_type"]').value
                  , Name = el.querySelector('input[name="name"]').value
                  , Price = parseInt(el.querySelector('input[name="price"]').value, 10)
                  , Discount = el.querySelector('input[name="discount"]').value
                  ;
                if (!Image || !Image[0] || Image[0].size > 2 * 1024 * 1024 && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                if (ItemType == '0' && !error) error = "<div class='b bb pd10'>Please select a type</div><div class='pd10'>Select a type for this item.</div>";
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
                $('body').spin();
                //submit package
                var fd = new FormData();
                fd.append('action', 'addItem');
                fd.append('ownerID', UUID);
                fd.append('image', Image[0]);
                fd.append('category', MAIN_CATEGORY);//e-commerce,food,ticket,general
                fd.append('subcategory', SUB_CATEGORY);//if general: gas,laundry,graphics,makeup
                fd.append('item_type', ItemType);//meal,snacks...//regular,VIP...//
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
                        // var d = JSON.parse(d);
                        if (d.error) return toast('Unable to add item');
                        toast('Item added successfully');
                        var p = {
                            id: d.success,
                            pr: Price,
                            cg: MAIN_CATEGORY,
                            sb: SUB_CATEGORY,
                            tp: ItemType,
                            nm: Name,
                            ds: Discount
                        }
                        $('#food-menu-container').prepend(buildItems([p], true, true));
                        App.closeCurrentView();
                    },
                    error: function() { toast('Unable to connect'); },
                    complete: function() {
                        el.dataset.disabled = 'false';
                        $('body').unspin();
                    }
                });
                break;
            case 'ticket-add-form':
                var Image = el.querySelector('input[name="images"]').files
                  , Name = el.querySelector('input[name="name"]').value
                  , ItemType = el.querySelector('select[name="item_type"]').value
                  // , Price = parseInt(el.querySelector('input[name="price"]').value, 10)
                  // , Discount = el.querySelector('input[name="discount"]').value
                  // , Amount = el.querySelector('input[name="amount"]').value
                  , Venue = el.querySelector('textarea[name="venue"]').value

                  , Year = el.querySelector('input[name="year"]').value
                  , Month = el.querySelector('input[name="month"]').value
                  , Day = el.querySelector('input[name="day"]').value
                  , Hour = el.querySelector('input[name="hour"]').value
                  , Min = el.querySelector('input[name="min"]').value
                  
                  , AllTickets = []
                  , LocalTickets = []
                  , EventDate = Year + '-' + Month + '-' + Day + ' ' + Hour + ':' + Min
                  ;
                var cgs = el.querySelectorAll('.ticket_category');
                cgs.forEach(function(t) {
                    var TicketType = t.querySelector('select[name="category"]').value;
                    var Price = parseInt(t.querySelector('input[name="price"]').value, 10);
                    var Discount = parseInt(t.querySelector('input[name="discount"]').value, 10) || 0;
                    var Seats = parseInt(t.querySelector('input[name="seats"]').value, 10) || 0;
                      ;
                    if (TicketType == '0' || isNaN(Price)) return;
                    var entry = [TicketType, Price, Discount, Seats];
                    var ticket = {nm: TicketType, pr: Price, ds: Discount, st: Seats};
                    // console.log(entry);
                    AllTickets.push(entry);
                    LocalTickets.push(ticket);
                });

                if (!Image || !Image[0] || Image[0].size > 2 * 1024 * 1024 && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                if (ItemType == '0' && !error) error = "<div class='b bb pd10'>Please select a type</div><div class='pd10'>Select a type for this ticket.</div>";
                if (!Name && !error) error = "<div class='b bb pd10'>Please add a Name</div><div class='pd10'>A name is required to identify this event.</div>";
                if (!Venue && !error) error = "<div class='b bb pd10'>Please add a Venue</div><div class='pd10'>Please state the venue for this event.</div>";
                // if ((!Price || isNaN(Price)) && !error) error = "<div class='b bb pd10'>Please add a Price</div><div class='pd10'>Price should include numbers only.</div>";
                // Discount = parseInt(Discount) || 0;
                // Amount = parseInt(Amount) || 0;
                // if (Category == '0' && !error) error = "<div class='b bb pd10'>Please select a category</div><div class='pd10'>Select a category for this event.</div>";
                if (AllTickets.length == 0 && !error) error = "<div class='b bb pd10'>Please add a Ticket</div><div class='pd10'>You must add at least 1 ticket with a complete information.</div>";
                //
                if (error) {
                    var h = '<div class="pd10">'+error+'<div class="fw fx"><div class="fx60"></div><div class="pd516 b bg-ac c-o ac">OK</div></div></div>';
                    $('#menuModal').show();
                    $('#menuFlexer').html(h).zoom();
                    return;
                }
                $('body').spin();
                //submit package
                var fd = new FormData();
                fd.append('action', 'addItem');
                fd.append('ownerID', UUID);
                fd.append('image', Image[0]);
                fd.append('name', Name);
                fd.append('venue', Venue);
                fd.append('event_date', EventDate);
                fd.append('item_type', ItemType);//tickets: pool,hangout,club...//[[new]] no mote//regular,VIP...
                fd.append('all_tickets', JSON.stringify(AllTickets));//regular,VIP...//all in one JSON stringified object
                // fd.append('category', Category);
                fd.append('price', 0);
                fd.append('discount', 0);
                // fd.append('amount', Amount);//[[new]]
                fd.append('category', MAIN_CATEGORY);//1.e-commerce,2.food,3.ticket,4.general
                fd.append('subcategory', SUB_CATEGORY);//if general: gas,laundry,graphics,makeup

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
                        //change the banner info [[continue]][[now]]
                        // tp: ItemType,
                        // nm: Name,
                        // ad: Venue,
                        /*
                        $v = $('.items-view-category[data-catg="'+catg+'"]');
                        $v.show();
                        $v.find('.shop-banner').css('backgroundImage', 'url('+MY_URL+'/img/'+folder+'/'+shopId+'.jpg)');
                        $v.find('.display-name').text(shopName);
                        if (catg == '3') $v.find('.event-type').text(EVENTS[this.dataset.eventType]);
                        $v.find('.user-address').text(shopAddress);
                        */
                        var p = {//[[continue]]
                            ui: UUID,
                            id: d.success,
                            cg: '3',
                            ts: LocalTickets
                        }
                        $('#food-menu-container').prepend(buildItems([p], true, true));
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
    }).on('click', '.ticket_closer', function(e) {
        $(this).closest('.ticket_category').remove();
        var el = document.querySelector('#ticket_add');
        var next = Number(el.dataset.next) - 1;
        el.dataset.next = next;
        var $counts = $('.ticket_count');
        $.each($counts, function(i) {
            this.innerText = (i + 1);
        });
    }).on('click', '#ticket_add', function(e) {
        var next = this.dataset.next;
        this.dataset.next = Number(next) + 1;
        var h="<div class='fw ticket_category remove pd10 b4-r mg-b16 Orange c-w'>\
                <div class='fw f12 mg-b ps-r b'>ADD A TICKET (<span class='ticket_count'>"+next+"</span>)<span class='ticket_closer ps-a lh0 mg-tm t0 r0'>x</span></div>\
                <select name='category' class='fw pd20 bg mg-b16 b4-r ba'>\
                    <option value='0'>Select Ticket Category</option>\
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
    }).on('click', '.menu-btn', function(e) {
        $(this).addClass('active').siblings('.active').removeClass('active');
        // change tabs appropriately
    }).on('touchstart click', '.st-p', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }).on('click', '.Modal', function() {
        $(this).hide();
    }).on('click', '.modalClose', function() {
        $('#menuModal').hide();
    }).on('touchmove', '.Modal', function(e) {
        if (e.cancelable)
        e.preventDefault();
        e.stopPropagation();
    }).on('click', '#menu-button', function() {
        mDrawer.style.transition = 'transform 200ms ease-out';
        mDrawer.style.transform = 'translate3d(0, 0, 0)';
        mDrawer.classList.add('sh-l');
        mModal.style.display = 'block';
    }).on('click', '.item-edit', function(e) {
        console.log('Will edit: ' + this.dataset.itemId);
        // [[continue]]
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
    }).on('click', '.go-to-cart', function(e) {
        var catg = this.dataset.catg;
        var sub = this.dataset.sub;
        var $menu;
        if (catg == '4') {
            $menu = $('.menu-container[data-sub="'+sub+'"]');
            //
        } else {
            $menu = $('.menu-container[data-catg="'+catg+'"]');
            //
        }

        var orders = [];

        switch(catg) {
            case '1':
                //e-commerce
                break;
            case '2':
                var items = $menu.find('.item-count'); // console.log(items.length);
                $.each(items, function() {
                    var tt = this.innerText;// console.log(tt);
                    if (tt == 0) return;
                    var id = this.dataset.itemId;
                    var nm = this.dataset.itemName;
                    var pr = this.dataset.itemPrice;
                    var ds = this.dataset.itemDiscount;
                    orders.push({id: id, nm: nm, pr: parseFloat(pr).toFixed(2), ds: parseFloat(ds).toFixed(2), tt: tt});
                });
                break;
        }
        // console.log(orders);//[[continue]]
        if (orders[0]) {
            ORDER = orders;//global
            App.changeViewTo('#invoiceView');
            $('#invoice-content').html(buildInvoice(orders, catg));//[[continue]]
        }
    }).on('click', '#proceed-to-address', function(e) {//on invoice view
        App.changeViewTo('#dropoffView');
        //
    }).on('click', '#proceed-to-card-details', function(e) {//from address view
        var fm = document.querySelector('#dropoff-content');
        var address = fm.querySelector('input[name="address"]').value;
        var name = fm.querySelector('input[name="name"]').value;
        var phone = fm.querySelector('input[name="phone"]').value;
        var deliveryInstruction = fm.querySelector('textarea[name="deliveryInstruction"]').value;
        //
        ORDER_DESTINATION = {ad: address, nm: name, ph: phone, is: deliveryInstruction};
        App.changeViewTo('#cardView');
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
        //
        $('body').spin();
        $.ajax({
            url: MY_URL + "/send.php",
            data: {
                action: 'createOrder',
                price: ORDER_CHARGES,
                invoice: ORDER,
                details: ORDER_DESTINATION,
                sellerID: 'Campus',
                buyerID: UUID
            },
            method: "POST",
            timeout: 30000,
            dataType: 'json',
            success: function(p) {
                if (p.state == 'success') {
                    //
                } else {
                    //
                }
            },
            complete: function() {
               //
            }
        });

        // if success, store in db
        // ORDER and ORDER_DESTINATION
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
        // if (!e.target.closest('.view-locator')) e.preventDefault();x
        // console.log(e.target);
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
            h+="<div class='w85p-c i-b ov-h mg-r sh-a ba ps-r bs-r shop-link"
                    +"' data-shop-id='"+c.id
                    +"' data-catg='"+c.cg
                    +"' data-sub='"+c.sb
                    +"' data-shop-name='"+c.nm
                    +"' data-event-type='"+c.tp
                    +"' data-shop-address='"+c.ad
                    +"'>\
                    <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                        <img src='"+MY_URL+"/img/items/"+c.id+".jpg' class='fw'>\
                    </div>\
                    <div class='fw ps-a tx-sh c-w caption lh-i b0 l0 pd10'>\
                        <div class='fw b f16'>"+c.nm+"</div>\
                        <div class='fw b f16 c-o'>"+EVENTS[c.tp]+"</div>\
                        <div class='fw b c-o'>"+c.dt+"</div>\
                        <div class='fw f10'>"+c.ad+"</div>\
                    </div>\
                </div>";
        });
        h+="<div class='w85p-c i-b ov-h mg-r sh-a ba ps-r bs-r more-services' data-catg='3'>\
                <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                    <img src='res/img/icon/party.jpg' class='fw'>\
                </div>\
                <div class='fw ps-a tx-sh c-w caption lh-i b0 l0 pd10'>\
                    <div class='fw b f14'>More...</div>\
                    <div class='fw ovx-h ovy-a f10'>Browse more events</div>\
                </div>\
            </div>";
        return (h);
    }
    function buildRestaurants(p) {
        var h = '';
        p.forEach(function(c) {
            h+="<div class='w85p-c i-b ov-h mg-r sh-a ba ps-r bs-r shop-link"
                    +"' data-shop-id='"+c.ui
                    +"' data-catg='"+c.cg
                    +"' data-sub='"+c.tp
                    +"' data-shop-name='"+c.nm
                    +"' data-shop-address='"+c.ad
                    +"'>\
                    <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                        <img src='"+MY_URL+"/img/users/"+c.ui+".jpg' class='fw'>\
                    </div>\
                    <div class='fw ps-a tx-sh c-w caption lh-i b0 l0 pd10'>\
                        <div class='fw b f16'>"+c.nm+"</div>\
                        <div class='fw ovx-h ovy-a f10'>"+c.ad+"</div>\
                    </div>\
                </div>";
        });
        h+="<div class='w85p-c i-b ov-h mg-r sh-a ba ps-r bs-r more-services' data-catg='2'>\
                <div class='fw fh fx fx-ac fx-jc ov-h bg-mod'>\
                    <img src='res/img/icon/food.jpg' class='fw'>\
                </div>\
                <div class='fw ps-a tx-sh c-w caption lh-i b0 l0 pd10'>\
                    <div class='fw b f14'>More...</div>\
                    <div class='fw ovx-h ovy-a f10'>Browse more restaurants</div>\
                </div>\
            </div>";
        return (h);
        //
    }
    function buildItems(p, user, local) {//local(future)
        var h = '';
        var catg = p[0].cg;
        //
        if (catg == '1') {//e-commerce
            //
        } else if (catg == '2') {//food
            p.forEach(function(c) {
            h+="<div class='fw pd16 mg-tx sh-c' data-type='"+c.tp+"'>\
                    <div class='fw fx fx-as'>\
                        <div class='w120 xh120 ov-h'><img src='"+MY_URL+"/img/items/"+c.id+".jpg' class='fw bs-r'></div>\
                        <div class='fx60 mg-lx'>\
                            <div class='f16 b'>"+c.nm+"</div>\
                            <div class='fw fx fx-ae mg-t'>\
                                <div class='fx50'>\
                                    <div class='"+(c.ds > 0 ? "tx-lt c-g f10" : "f16")+"'>&#8358;"+c.pr+"</div>"+
                                    (c.ds > 0 ? "<div class='f16'>&#8358;"+(c.pr - c.ds)+"</div>" : "")+
                                "</div>"+
                                (c.ui == UUID ? 
                                "<div class='fx fx-je c-g'>\
                                    <div class='item-edit f20 mg-rxx icon-edit' data-item-id='"+c.id+"'></div>\
                                    <div class='item-remove f20 icon-logout' data-item-id='"+c.id+"'></div>\
                                </div>":
                                "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.id+"'>\
                                    <div class='fx fx-ac fx-jc Orange c-w b2-r box20 f20 item-subtract'>-</div>\
                                    <div class='fx fx-ac fx-jc w32 item-count tx-c"
                                        +"' data-item-id='"+c.id
                                        +"' data-item-name='"+c.nm.replace("'", '&apos;')
                                        +"' data-item-price='"+c.pr
                                        +"' data-item-discount='"+c.ds
                                        +"'>0</div>\
                                    <div class='fx fx-ac fx-jc Orange c-w b2-r box20 f20 item-add'>+</div>\
                                </div>"
                                )+
                            "</div>\
                        </div>\
                    </div>\
                </div>";
            });
            var $v = $('.menu-container[data-catg="2"]');
            if (local) $v.append(h); else $v.html(h);
        } else if (catg == '3') {//ticket
            p.forEach(function(c) {//c.ts[[continue]]
                c.ts.forEach(function(v) {
                    h+="<div class='fw pd16 mg-tx sh-c'>\
                        <div class='fw fx fx-as'>\
                            <div class='fx60 mg-lx'>\
                                <div class='f16 b'>"+TICKETS[v.nm]+"</div>\
                                <div class='fw fx fx-ae mg-t'>\
                                    <div class='fx50'>\
                                        <div class='"+(v.ds > 0 ? "tx-lt c-g f10" : "f16")+"'>&#8358;"+v.pr+"</div>"+
                                        (v.ds > 0 ? "<div class='f16'>&#8358;"+(v.pr - v.ds)+"</div>" : "")+
                                    "</div>"+
                                    (c.ui == UUID ? 
                                    "<div class='fx fx-je c-g'>\
                                        <div class='item-edit f20 mg-rxx icon-edit' data-item-id='"+c.id+"'></div>\
                                        <div class='item-remove f20 icon-logout' data-item-id='"+c.id+"'></div>\
                                    </div>":
                                    "<div class='fx fx-jc item-order-spinner' data-item-id='"+c.id+"'>\
                                        <div class='fx fx-ac fx-jc Orange c-w b2-r box20 f20 item-subtract'>-</div>\
                                        <div class='fx fx-ac fx-jc w32 item-count tx-c"
                                            +"' data-item-id='"+c.id
                                            +"' data-item-name='"+TICKETS[v.nm]
                                            +"' data-item-price='"+v.pr
                                            +"' data-item-discount='"+v.ds
                                            +"'>0</div>\
                                        <div class='fx fx-ac fx-jc Orange c-w b2-r box20 f20 item-add'>+</div>\
                                    </div>"
                                    )+
                                "</div>\
                            </div>\
                        </div>\
                    </div>";
                });
            });
            var $v = $('.menu-container[data-catg="3"]');
            if (local) $v.append(h); else $v.html(h);
        } else if (catg == '4') {//food
            var sub = p[0].sb;
            // if (sub == '1') {}
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
                    <span class=''>&#8358;"+price+"</span>\
                </div>";
        });
        var charges = total + 500;
        ORDER_TOTAL = total;
        ORDER_CHARGES = 500;
        h+="<div class='fw pd30'><input type='text' name='voucher' class='fw pd16 bg-ac tx-c b4-r ba' placeholder='Enter Voucher Code'></div>\
            <div class='fw fx pd1015'><span class='fx60'>Subtotal</span><span class=''>&#8358;"+total+"</span></div>\
            <div class='fw fx pd1015'><span class='fx60'>Service Charge</span><span class=''>&#8358;500</span></div>\
            <div class='fw fx b bt bb pd16'><span class='fx60'>Total</span><span class=''>&#8358;"+charges+"</span></div>";
        // $('#proceed-to-address').attr('data-due-amount', charges);
        return h;
    }
    function localizeUserDetails(p) {
        SQL.transaction(function(i) {
            i.executeSql(
                "INSERT INTO on_user(id,uuid,email,username,campus_key,user_type,fullname,address,main_category,subcategory,phone) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [1, p.ui, p.em, p.un, p.sk, p.ut, p.fn, p.ad, p.cg, p.sb, p.ph]
            );
        }, function(){}, function() {
            //
              UUID = p.ui
            , EMAIL = p.em
            , USERNAME = p.un
            , CAMPUSKEY = p.sk
            , USERTYPE = p.ut
            , ADDRESS = p.ad
            , MAIN_CATEGORY = p.cg
            , SUB_CATEGORY = p.sb
            ;
            preparePage();

            /*App.changeViewTo('#landingView');
            if (USERTYPE == 0) {//buyer
                $('.forSeller').addClass('hd');
                $('.forBuyer').removeClass('hd');
                //
                fetchRestaurants('timeline');
            } else if (USERTYPE == 1) {//seller
                var tx = '';
                if (MAIN_CATEGORY == '4') tx = GENERAL_SERVICES[SUB_CATEGORY];
                else tx = MAIN_CATEGORIES[MAIN_CATEGORY];
                //
                $('#service-name').text(tx);
                $('.forSeller').removeClass('hd');
                $('.forBuyer').addClass('hd');
            }*/
        });
    }


    function toast(message) {
        alert(message);return;
        //
        window.plugins.toast.showShortBottom(message, function(a){
            console.log('toast success: ' + a);
        }, function(b){
            alert('toast error: ' + b);
        });
    }

});