/*
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
    // , MY_URL = "http://192.168.43.75/oncampus/api"
    // , RES_URL = "http://192.168.43.75/oncampus/api/chat"
    //
    , MY_URL = "http://172.20.10.4/oncampus/api"
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
            , category INT NOT NULL
            , servicetype INT NOT NULL
            )`,[], s => {
                s.executeSql("SELECT * FROM on_user WHERE id = ?", [1], (k, result) => {
                    var len = result.rows.length;
                    if (len > 0) {//data found
                        var r = result.rows.item(0);
                        //
                          UUID = r.uuid
                        , EMAIL = r.email
                        , USERNAME = r.username
                        , CAMPUSKEY = r.campus_key
                        , USERTYPE = r.user_type
                        , PHONE = r.phone
                        , FULLNAME = r.fullname
                        , ADDRESS = r.address
                        ;
                        //
                        App.changeViewTo('#landingView');
                        if (USERTYPE == 0) {//buyer
                            $('.forSeller').addClass('hd');
                            $('.forBuyer').removeClass('hd');
                        } else if (USERTYPE == 1) {
                            $('.forSeller').removeClass('hd');
                            $('.forBuyer').addClass('hd');
                        }
                    } else {//no data
                        $('#splash-image').removeClass('blink');
                        if (Store.getItem('doneBoarding')) App.changeViewTo('#signupView');
                        else App.changeViewTo('#progress1View');
                    }
                });
            });
    }, function() {/*error*/}, function() {/*success*/});









    











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
        
    }).on('click', '#viewItems', function() {//[[continue]]
        App.changeViewTo('#packagesView');
        $('#brandName').text(USERNAME);
        $('#brandAddress').text(ADDRESS);
        $('#addItem').show();//for seller(owned)
        //
        //
        $('body').spin();
        $.ajax({
            url: MY_URL + "/fetch.php",
            data: {
                action: 'fetchItems',
                shopID: UUID
            },
            timeout: 30000,
            dataType: 'json',
            method: "GET",
            success: function(p) {
                if (p.length > 0) {
                    $('#items-container').html(buildItems(p, false));
                } else {
                    toast('No items was found.');
                }
            },
            complete: function() {$('body').unspin();}
        });
        //
    }).on('click', '#addItem', function() {
        $('#create-image-preview').removeClass('hd');
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
                $('#create-image-preview').attr('src', this.result).addClass('fw');
                // that.previousElementSibling.src = this.result;
                // that.previousElementSibling.classList;
            }
            reader.readAsDataURL(this.files[0]);
        } else {
            $('#create-image-preview').attr('src', 'res/img/icon/upload.png').removeClass('fw');
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
                                , sv: '0'
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
                  , ServiceType = el.querySelector('#services-select').value
                  , Phone = el.querySelector('input[name="phone"]').value
                  , Pass = el.querySelector('input[name="password"]').value
                  , Campus = el.querySelector('select[name="institute"]').value;
                  ;
                
                if (!Email && !error) error = "<div class='b bb pd10'>Provide your email address</div><div class='pd10'>Your email address is needed to validate your account.</div>";
                if (!Fullname && !error) error = "<div class='b bb pd10'>Full Name is Required</div><div class='pd10'>Your full name is required.</div>";
                if (!Username && !error) error = "<div class='b bb pd10'>Display/Brand Name is Required</div><div class='pd10'>Your Display/Brand name would be displayed on your profile.</div>";
                if (!Address && !error) error = "<div class='b bb pd10'>Your Address is Required</div><div class='pd10'>Your address is required for pickup.</div>";
                if (Category == '0' && !error) error = "<div class='b bb pd10'>You must select your business category</div>";
                if (Category == '4' && ServiceType == '0' && !error) error = "<div class='b bb pd10'>You must select your service type</div>";
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
                        servicetype: ServiceType,
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
                                , sv: ServiceType
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
            case 'profile-edit-form':
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
            case 'packages-add-form':
                var Image = el.querySelector('input[name="images"]').files
                  , Category = el.querySelector('select[name="category"]').value
                  , Name = el.querySelector('input[name="name"]').value
                  , Price = parseInt(el.querySelector('input[name="price"]').value, 10)
                  , Discount = el.querySelector('input[name="discount"]').value
                  ;
                if (!Image || !Image[0] || Image[0].size > 2 * 1024 * 1024 && !error) error = "<div class='b bb pd10'>Image Error!</div><div class='pd10'>Please attach an image to your item (Maximum size = 2MB).</div>";
                if (Category == '0' && !error) error = "<div class='b bb pd10'>Please select a Category</div><div class='pd10'>Select a category for this item.</div>";
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
                fd.append('action', 'addMenu');
                fd.append('ownerID', UUID);
                fd.append('image', Image[0]);
                fd.append('category', Category);
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
                            cg: Category,
                            nm: Name,
                            ds: Discount
                        }
                        $('#items-container').prepend(buildItems([p], true));
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
    }).on('click', '.menu-btn', function(e) {
        $(this).addClass('active').siblings('.active').removeClass('active');
        // change tabs appropriately
    }).on('click', '.st-p', function(e) {
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
    }).on('click', '#proceed-to-cart', function(e) {
        var key = this.dataset.key;
        var items = $('#items-container .item-count');
        // console.log(items.length);
        var orders = [];
        $.each(items, function() {
            var tt = this.innerText;
            // console.log(tt);
            if (tt == 0) return;
            var id = this.dataset.itemId;
            var nm = this.dataset.itemName;
            var pr = this.dataset.itemPrice;
            var ds = this.dataset.itemDiscount;
            orders.push({id: id, nm: nm, pr: parseFloat(pr).toFixed(2), ds: parseFloat(ds).toFixed(2), tt: tt});
        });
        // console.log(orders);//[[continue]]
        if (orders[0]) {
            ORDER = orders;//global
            App.changeViewTo('#invoiceView');
            $('#invoice-content').html(buildInvoice(orders));
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
            D.Z = VIEW80, 
            D.X = touch.pageX, 
            D.Y = touch.pageY;
            // if (touch.pageX > 80) return;
            // mDrawer.style.transition = '';
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
        var d = mDrawer;
        if (D.Z > -150) {
            d.style.transform = 'translate3d(0, 0, 0)';
            mModal.style.display = 'block';
        } else {
            d.style.transform = 'translate3d(-105%, 0, 0)';
            d.classList.remove('sh-l');
            mModal.style.display = 'none';
        }
        d.style.transition = 'all 200ms ease-out';
        d.addEventListener('transitionend', function() {d.style.transition = '';});
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
        // mDrawer.addEventListener('transitionend', function() {mDrawer.style.transition = '';});
    }

 





    function buildItems(p, local) {//local(future)
        var h = '';
        p.forEach(function(c) {
            h+="<div class='fw pd16 mg-tx sh-c' data-catg='"+c.cg+"'>\
                    <div class='fw fx fx-as'>\
                        <div class='w120 xh120 ov-h'><img src='"+MY_URL+"/img/items/"+c.id+".jpg' class='fw bs-r'></div>\
                        <div class='fx60 mg-lx'>\
                            <div class='f16 b'>"+c.nm+"</div>\
                            <div class='fw fx fx-ae mg-t'>\
                                <div class='fx50'>\
                                    <div class='"+(c.ds > 0 ? "tx-lt c-g f10" : "f16")+"'>&#8358;"+c.pr+"</div>"+
                                    (c.ds > 0 ? "<div class='f16'>&#8358;"+(c.pr - c.ds)+"</div>" : "")+
                                "</div>"+
                                (c.ui !== UUID ? 
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
        return h;
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
                "INSERT INTO on_user(id,uuid,email,username,campus_key,user_type,fullname,address,category,servicetype,phone) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [1, p.ui, p.em, p.un, p.sk, p.ut, p.fn, p.ad, p.cg, p.sv, p.ph]
            );
        }, function(){}, function() {
            //
              UUID = p.uuid
            , EMAIL = p.em
            , USERNAME = p.un
            , CAMPUSKEY = p.sk
            , USERTYPE = p.ut
            , ADDRESS = p.ad
            ;

            App.changeViewTo('#landingView');
            if (USERTYPE == 0) {
                $('.forSeller').addClass('hd');
                $('.forBuyer').removeClass('hd');
            } else if (USERTYPE == 1) {
                $('.forSeller').removeClass('hd');
                $('.forBuyer').addClass('hd');
            }
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