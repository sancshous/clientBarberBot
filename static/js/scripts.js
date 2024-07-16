// static/scripts.js
$(document).ready(function() {

    let tg = window.Telegram.WebApp;

    tg.expand();

    tg.MainButton.textColor = '#FFFFFF';
    tg.MainButton.color = '#2cab37';

    let masters = [];
    let services = [];
    let masters_difficult = []
    let closedTimes = [];
    let cart_services = [];
    let final_cart = {};
    let BOOK_ID;

    if (window.matchMedia("(min-width: 768px)").matches) {
        $.bsCalendar.setDefault('width', '400px');
        $('#example').bsCalendar('refresh');
        $('#example').css('width', '100%')
    } else {
        $.bsCalendar.setDefault('width', '300px');
        $('#example').bsCalendar('refresh');
        $('#example').css('width', '100%')
    }

    Date.prototype.formatDate = function (asArray) {
        let d = new Date(this.valueOf()), month = '' + (d.getMonth() + 1), day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return asArray ? [year, month, day] : [year, month, day].join('-');
    }

    function showMessage(message) {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #b0000f, #c93d3d)",
            }
          }).showToast();
    }

    function fetchMasters(callback) {
        $.ajax({
            url: '/masters',
            method: 'GET',
            success: function(data) {
                masters = [];
                masters = data;
                callback();
            }
        });
    }

    function fetchServices(callback) {
        $.ajax({
            url: '/services',
            method: 'GET',
            success: function(data) {
                services = [];
                services = data;
                callback();
            }
        });
    }

    function fetchMastersDifficult(pos_id, callback) {
        $.ajax({
            url: `/master_difficult/${pos_id}`,
            method: 'GET',
            success: function(data) {
                masters_difficult = [];
                masters_difficult = data;
                callback();
            }
        });
    }

    function fetchClosedTimes(date, callback) {
        const masterId = final_cart.master.id;
        $.ajax({
            url: `/closed-times/${date}`,
            method: 'GET',
            data: { master_id: masterId },
            success: function(data) {
                closedTimes = []
                closedTimes = data;
                callback();
            }
        });
    }

    function bookAppointment(callback) {
        $.ajax({
            url: '/book',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(final_cart),
            success: function(response) {
                BOOK_ID = response[0]
                callback();
            }
        });
    }

    $('.back-arrow').on('click', function () {
        $(this).hide()
        $('#masters-form').hide();
        $('#services-form').hide();
        $('#result-form').hide();
        $('#dates-form').hide();
        $('#home-form').show();
        final_cart = {};
        cart_services = [];
        $('#cart').hide()
        $('#time-container').empty()
    })

    function picMaster() {
        fetchMasters(function () {
            $('#home-form').hide();
            $('.back-arrow').show();
            $('#masters-form').show();
            var mastersContainer = $('#masters-container')
            mastersContainer.empty();
            var filteredMasters = masters
            if(final_cart.hasOwnProperty('service')) {
                var maxDifficlt = Math.min(...final_cart.service.map(o => o.difficult))
                filteredMasters = masters.filter(elem => elem.pos_id <= maxDifficlt)
            }
            var cart = $('#cart');
            $('#cart-container').empty()
            filteredMasters.sort((a, b) => {
                const posA = a.pos_id; // ignore upper and lowercase
                const posB = b.pos_id; // ignore upper and lowercase
                if (posA < posB) {
                    return -1;
                }
                if (posA > posB) {
                    return 1;
                }
                
                // names must be equal
                return 0;
            });
            var divColumnAny = $(`<div class="form-column" data-id="0">`)
            var divAny = $('<div class="form-row">')
            var avatarAny = $('<div style="margin-right: 7px;" class="svg-container"><img src="../static/icons/masters.svg"></div>')
            var nameAny = $(`<span>Любой специалист</span>`)
            var radioAny = $('<input style="margin-left:auto;" class="form-check-input radio" type="radio" name="master">')
            divAny.append(avatarAny, nameAny, radioAny)
            divColumnAny.append(divAny)
            divColumnAny.on('click', function (e) {
                e.preventDefault()
                var checked = $(this).find('input').is(':checked')
                if(!checked)
                    $(this).find('input').prop('checked', true);
                var formColumns = $(this).parent().find('.form-column')
                formColumns.each(function () {
                    $(this).css('height', '60px') 
                    $(this).find('.form-tooltip').remove()
                })
                cart.show()
                addMasterToCart({'id' : 0})
                updateCartBtn('Выбрать услугу')
            })
            radioAny.on('click', function (e) {
                e.stopPropagation();
                var formColumns = $(this).parent().parent().parent().find('.form-column')
                formColumns.each(function () {
                    $(this).css('height', '60px') 
                    $(this).find('.form-tooltip').remove()
                })
                cart.show()
                addMasterToCart({'id' : 0})
                updateCartBtn('Выбрать услугу')
            })
            mastersContainer.append(divColumnAny)
            filteredMasters.forEach(master => {
                var divColumn = $(`<div class="form-column" data-id="${master.id}">`)
                var div = $(`<div class="form-row">`)
                var avatar = $('<img style="margin-right: 7px;" src="../static/icons/avatar.svg">')
                var divUser = $('<div style="display:flex;flex-direction:column;">')
                var name = $(`<span><strong>${master.name}</strong></span>`)
                var pos = $(`<span class="pos">${master.pos_name}</span>`)
                divUser.append(name, pos)
                var radio = $('<input style="margin-left:auto;" class="form-check-input radio" type="radio" name="master">')
                radio.on('click', function (e) {
                    e.stopPropagation();
                    var formColumns = $(this).parent().parent().parent().find('.form-column')
                    formColumns.each(function () {
                        $(this).css('height', '60px') 
                        $(this).find('.form-tooltip').remove()
                    })
                    $(this).parent().parent().css('height', '100px')
                    getServicesInfo(master.pos_id, divColumn)
                    cart.show()
                    addMasterToCart(master)
                    updateCartBtn('Выбрать услугу')
                })
                div.append(avatar, divUser, radio)
                divColumn.append(div)
                divColumn.on('click', function (e) {
                    e.preventDefault()
                    var checked = $(this).find('input').is(':checked')
                    if(!checked)
                        $(this).find('input').prop('checked', true);
                    var formColumns = $(this).parent().find('.form-column')
                    formColumns.each(function () {
                        $(this).css('height', '60px') 
                        $(this).find('.form-tooltip').remove()
                    })
                    $(this).css('height', '100px')
                    getServicesInfo(master.pos_id, divColumn)
                    cart.show()
                    addMasterToCart(master)
                    updateCartBtn('Выбрать услугу')
                })
                mastersContainer.append(divColumn)
            });
        })
    }

    $('#picMaster').on('click', function () {
        picMaster()
    });

    function getServicesInfo(pos_id, container) {
        fetchMastersDifficult(pos_id, function () {
            var services_list = ''
            masters_difficult.forEach(service => {
                services_list += service.name + ', '
            });
            var servicesTolltip = $(`<span class="form-tooltip" style="opacity: 50%;"><strong>Услуги: </strong><span>${services_list.slice(0, -2)}</span></span>`)
            container.append(servicesTolltip)
        })
    }

    function addMasterToCart(master) {
        final_cart["master"] = master;
        console.log(final_cart)
    }

    function addServiceToCart(service) {
        final_cart["service"] = service;
        console.log(final_cart)
    }


    function updateCartBtn(text) {
        var btn = $('.cartBtn')
        if(final_cart.hasOwnProperty('master') && final_cart.hasOwnProperty('service') && text != 'Готово'  && text != 'Записаться')
            btn.text('Выбрать дату и время')
        else
            btn.text(text)
    }

    function picService() {
        fetchServices(function () {
            $('#home-form').hide();
            $('.back-arrow').show();
            $('#services-form').show();
            var servicesContainer = $('#services-container')
            servicesContainer.empty();
            var counter = 0;
            var filteredServices = services;
            if(final_cart.hasOwnProperty('master'))
                filteredServices = services.filter(elem => elem.difficult >= final_cart.master.pos_id)
            filteredServices.forEach(service => {
                var div = $(`<div class="form-row" data-id="${service.id}">`);
                var div_text = $('<div class="form-row-text">')
                var div_head = $('<div class="form-row-head">')
                var name = $(`<span><strong>${service.name}</strong></span>`)
                var duration = $(`<span class="duration">${service.duration} мин</span>`)
                var price = $(`<span><strong>${service.price} ₽</strong></span>`)
                div_head.append(name, duration)
                div_text.append(div_head, price)
                var check = $(`<div class="checkbox-wrapper-19 myCheckbox">
                    <input type="checkbox" id="cbtest${counter}" />
                    <label for="cbtest${counter}" class="check-box">
                    </div>
                `)
                div.append(div_text, check)
                div.on('click', function (e) {
                    e.preventDefault();
                    var checked = $(this).find('input').is(':checked')
                    $(this).find('input').prop('checked', !checked);
                    if(checked) {
                        cart_services = cart_services.filter(elem => elem.id != service.id)
                    } else {
                        cart_services.push(service)
                    }
                    $(document).trigger('updateCart')
                })
                servicesContainer.append(div)
                counter++;
            });
        })
    }

    $('#picService').on('click', function () {
        picService()
    });

    $(document).on('updateCart', function () {
        //console.log(cart_services)
        var cart = $('#cart');
        var cartContainer = $('#cart-container');
        var modalCartContainer = $('#modalCartContainer');
        var editCartModalHeader = $('#modalHeader')
        editCartModalHeader.empty();
        modalCartContainer.empty();
        cartContainer.empty();
        if(cart_services.length == 0) {
            cart.hide();
        } else {
            cart.show();
            addServiceToCart(cart_services)
            var header = $('<div style="display: flex; align-items: center; width:100%; cursor: pointer;">')
            var headerClone = header.clone();
            var end = cart_services.length >= 5 ? '' : 'и';
            if(cart_services.length == 1)
                end = 'а'
            var count = $(`<span>${cart_services.length} услуг${end}</span>`)
            var time = 0
            var price = 0
            cart_services.forEach(service => {
                time += service.duration
                price += service.price     
            });
    
            var strTime = time <= 60 ? `${time} мин.` : `${Math.trunc(time / 60)}ч. ${60 * ((time / 60) - Math.trunc(time / 60))} мин.`;
            var duration = $(`<span class="cart-time">${strTime}</span>`)
            var div = $('<div style="margin-left: auto; display: flex; align-items: center;">')
            var totalPrice = $(`<span style="margin-left:auto;"><strong>${price} ₽</strong></span>`)
            var editImg = $('<img style="margin-left: 5px;" src="../static/icons/edit.svg">')
            div.append(totalPrice, editImg)
            header.append(count, duration, div);
            header.on('click', function () {
                $('#editCartModal').modal('show')
            })
            updateCartBtn('Выбрать специалиста')
            cartContainer.prepend(header)
            headerClone.append(count.clone(), duration.clone(), totalPrice.clone())
            editCartModalHeader.prepend(headerClone)
            cart_services.forEach(service => {
                var row = $('<div style="display:flex; margin-bottom: 5px; align-items:center; width: 100%">');
                var column = $('<div style="display:flex; flex-direction:column;">');
                var nameSpan = $(`<span><strong>${service.name}</strong></span>`);
                var durationSpan = $(`<span class="duration">${service.duration} мин</span>`);
                column.append(nameSpan, durationSpan)
                var divPrice = $('<div style="margin-left:auto;display:flex;align-items:center;">')
                var totalPrice = $(`<span><strong>${service.price} ₽</strong></span>`)
                var closeSvg = $('<img style="cursor:pointer; margin-left: 3px;" src="../static/icons/close.svg">')
                divPrice.append(totalPrice, closeSvg)
                closeSvg.on('click', function () {
                    cart_services = cart_services.filter(elem => elem.id != service.id)
                    var formRows = $('#services-container').find('.form-row')
                    formRows.each(function () {
                        if($(this).attr('data-id') == service.id)
                            $(this).find('input').prop('checked', false);
                    })
                    $(document).trigger('updateCart')
                })
                row.append(column, divPrice)
                modalCartContainer.append(row)
            });
        }
    })

    function showResult() {
        var resultContainer = $('#result-container')
        var master = resultContainer.find('.master-name')
        var pos = resultContainer.find('.pos')
        master.text(final_cart.master.name)
        pos.text(final_cart.master.pos_name)

        var date = resultContainer.find('.result-date')
        date.text(formatLocaleDate(final_cart.date))
        var totalDuration = 0;
        var totalPriceNum = 0;
        final_cart.service.forEach(elem => {
            totalDuration += elem.duration;
            totalPriceNum += elem.price;
        });

        var timeStr = final_cart.time.includes('.') ? String(Math.trunc(Number(final_cart.time))) + ':30' : final_cart.time + ':00';
        var endTime = String(Number(final_cart.time) + totalDuration / 60)
        var endTimeStr = ''
        if(endTime.includes('.')) {
            if(endTime.includes('.25'))
                endTimeStr = String(Math.trunc(Number(endTime))) + ':15'
            else if(endTime.includes('.75'))
                endTimeStr = String(Math.trunc(Number(endTime))) + ':45'
            else
                endTimeStr = String(Math.trunc(Number(endTime))) + ':30'
        } else
            endTimeStr = endTime + ':00'
            
        timeStr += ' — ' + endTimeStr;
        var time = resultContainer.find('.result-time')
        time.text(timeStr)
        final_cart["end_time"] = endTimeStr
        var durationServicesHeader = $('#result-services-header').find('.duration')
        var strTime = totalDuration <= 60 ? `${totalDuration} мин.` : `${Math.trunc(totalDuration / 60)}ч. ${60 * ((totalDuration / 60) - Math.trunc(totalDuration / 60))} мин.`;
            
        durationServicesHeader.text(strTime)
        var resultServicesContainer = $('#result-services-container')
        resultServicesContainer.empty();
        final_cart.service.forEach(elem => {
            var row = $('<div style="display:flex; margin-bottom: 5px; align-items:center; width: 100%">');
            var column = $('<div style="display:flex; flex-direction:column;">');
            var nameSpan = $(`<span><strong>${elem.name}</strong></span>`);
            var durationSpan = $(`<span class="duration">${elem.duration} мин</span>`);
            column.append(nameSpan, durationSpan)
            var divPrice = $('<div style="margin-left:auto;display:flex;align-items:center;">')
            var totalPrice = $(`<span><strong>${elem.price} ₽</strong></span>`)
            divPrice.append(totalPrice)
            row.append(column, divPrice)
            resultServicesContainer.append(row)
        });
        var totalPrice = $('#totalPrice')
        totalPrice.text(String(totalPriceNum) + ' ₽')
    }

    function formatLocaleDate(datestring) {
        // Создаем объект Date из строки
        const date = new Date(datestring);

        // Создаем форматировщик для дня недели на русском языке
        const dayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' });
        const dayOfWeek = dayFormatter.format(date);

        // Создаем форматировщик для даты (день и месяц) на русском языке
        const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
        const dayAndMonth = dateFormatter.format(date);

        // Результат
        const result = `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}, ${dayAndMonth}`;
        return result;
    }

    Telegram.WebApp.onEvent("mainButtonClicked", function(){
        if($('#form-name').val() == '' && $('#form-phone').val() == '')
            showMessage('Заполните: Имя и Телефон!')
        else if($('#form-name').val() == '')
            showMessage('Заполните: Имя!')
        else if($('#form-phone').val() == '')
            showMessage('Заполните: Телефон!')
        else {
            final_cart["user_name"] = $('#form-name').val()
            final_cart["user_phone"] = $('#form-phone').val()
            final_cart["user_comment"] = $('#form-comment').val()
            bookAppointment(function () {
                final_cart["book_id"] = BOOK_ID;
                tg.sendData(JSON.stringify(final_cart));
            })
        }    
    })


    $('.cartBtn').on('click', function () {
        /*if($(this).text() == "Записаться") {
            final_cart["user_name"] = $('#form-name').val()
            final_cart["user_phone"] = $('#form-phone').val()
            final_cart["user_comment"] = $('#form-comment').val()
            bookAppointment(function () {
                console.log('Пиривет')
            })
        } else */ if(final_cart.hasOwnProperty('date')) {
            $('#result-form').show()
            //updateCartBtn('Записаться')
            $('#cart').hide()
            tg.MainButton.setText("Записаться")
		    tg.MainButton.show();
            showResult()
            $('#dates-form').hide();
        } else if(final_cart.hasOwnProperty('master') && final_cart.hasOwnProperty('service')) {
            $('#dates-form').show();
            $('#masters-form').hide();
            $('#services-form').hide();
            $('#cart').hide();
            $('.js-today').trigger('click')
        } else if(final_cart.hasOwnProperty('master')) {
            updateCartBtn('Выбрать дату и время')
            $('#masters-form').hide();
            picService()
        } else {
            updateCartBtn('Выбрать дату и время')
            $('#services-form').hide();    
            picMaster()
        }
    })

    $('#picDate').on('click', function () {
        $('#home-form').hide();
        $('.back-arrow').show();
        $('#dates-form').show();
    });

    $('#example').on('init',function (e) {
        console.log('hi')
    })

    $('#example').bsCalendar({
        locale: 'ru',
        url: null, // save as data-bs-target
        width: '400px',
        icons: {
          prev: 'fa-solid fa-arrow-left fa-fw',
          next: 'fa-solid fa-arrow-right fa-fw',
          eventEdit: 'fa-solid fa-edit fa-fw',
          eventRemove: 'fa-solid fa-trash fa-fw'
        },
        showTodayHeader: false, 
        showEventEditButton: false,
        showEventRemoveButton: false,
        showPopover: true, 
        popoverConfig: {
          animation: true,
          html: true,
          delay: 400,
          placement: 'top',
          trigger: 'hover'
        },
        formatPopoverContent: function (events) {
          return '';
        },
        formatEvent: function (event) {
          return drawEvent(event);
        },
        queryParams: function (params) {
          return params;
        },
        onClickEditEvent: function (e, event) {
        },
        onClickDeleteEvent: function (e, event) {
        },
    });

    $('#example').on('change-day', function (e, date, events) {
        fetchClosedTimes(date.formatDate(false), function () {
            var timeContainer = $('#time-container')
            timeContainer.empty()

            var before12 = $('<div class="day-section opened">')
            var divHeaderbefore12 = $('<div class="header-section">')
            var headerbefore12 = $('<h5>Утро</h5>')
            var arrowbefore12 = $('<img class="arrow" src="../static/icons/open-arrow.svg">')
            divHeaderbefore12.append(headerbefore12, arrowbefore12)
            divHeaderbefore12.on('click', function (e) {
                e.stopPropagation();
                openSection(divHeaderbefore12)
            })
            var timeContainerBefore12 = $('<div class="time-container">')
            fillTimeContainer(timeContainerBefore12, 'morning', date.formatDate(false))
            before12.append(divHeaderbefore12, timeContainerBefore12)

            var after12 = $('<div class="day-section opened">')
            var divHeaderafter12 = $('<div class="header-section">')
            var headerafter12 = $('<h5>День</h5>')
            var arrowafter12 = $('<img class="arrow" src="../static/icons/open-arrow.svg">')
            divHeaderafter12.append(headerafter12, arrowafter12)
            divHeaderafter12.on('click', function (e) {
                e.stopPropagation();
                openSection(divHeaderafter12)
            })
            var timeContainerAfter12 = $('<div class="time-container">')
            fillTimeContainer(timeContainerAfter12, 'day', date.formatDate(false))
            
            after12.append(divHeaderafter12, timeContainerAfter12)

            var after18 = $('<div class="day-section opened">')
            var divHeaderafter18 = $('<div class="header-section">')
            var headerafter18 = $('<h5>Вечер</h5>')
            var arrowafter18 = $('<img class="arrow" src="../static/icons/open-arrow.svg">')
            divHeaderafter18.append(headerafter18, arrowafter18)
            divHeaderafter18.on('click',  function (e) {
                e.stopPropagation();
                openSection(divHeaderafter18)
            })
            var timeContainerAfter18 = $('<div class="time-container">')
            fillTimeContainer(timeContainerAfter18, 'evening', date.formatDate(false))

            after18.append(divHeaderafter18, timeContainerAfter18)
            timeContainer.append(before12, after12, after18)
            var times = timeContainer.find('.time')
            times.each(function () {
                closedTimes.forEach(time => {
                    if($(this).attr('data-time') >= time.start && $(this).attr('data-time') < time.end)
                    $(this).addClass('closed-time')
                });
            })
        })
    })

    function fillTimeContainer(container, type, date) {
        container.empty()
        if(type == 'morning') {
            var start = 9
            while(start < 12) {
                var time = $(`<div data-time="${start}" class="time">${String(start).includes('.') ? String(Math.trunc(start)) + ':30' : String(start) + ':00'}</div>`)
                container.append(time)
                time.on('click', function (e) {
                    e.stopPropagation();
                    picTime(date, $(this))
                })   
                start += 0.5
            }
        } else if(type == 'day') {
            var start = 12
            while(start < 18) {
                var time = $(`<div data-time="${start}" class="time">${String(start).includes('.') ? String(Math.trunc(start)) + ':30' : String(start) + ':00'}</div>`)
                container.append(time)
                time.on('click', function (e) {
                    e.stopPropagation();
                    picTime(date, $(this))
                })   
                start += 0.5
            }
        } else {
            var start = 18
            while(start < 20) {
                var time = $(`<div data-time="${start}" class="time">${String(start).includes('.') ? String(Math.trunc(start)) + ':30' : String(start) + ':00'}</div>`)
                container.append(time)
                time.on('click', function (e) {
                    e.stopPropagation();
                    picTime(date, $(this))
                })            
                start += 0.5
            }
        }
    }

    function picTime(date, time) {
        var allTimes = $('#time-container').find('.time')
        allTimes.each(function () {
            $(this).removeClass('picked-time')    
        })
        time.addClass('picked-time')
        addDateTimeToCart(date, time.attr('data-time'))
    }

    function addDateTimeToCart(date, time) {
        updateCartBtn('Готово')
        $('#cart').show()
        final_cart["date"] = date
        final_cart["time"] = time
        console.log(final_cart)
    }

    function openSection(container) {
        var parent = container.parent()
        if(parent.hasClass('opened')) {
            parent.css('max-height', '35px')
            container.find('.arrow').css('transform', 'rotateX(360deg)')
            parent.find('.time-container').hide()
            parent.removeClass('opened')
        }
        else {
            parent.css('max-height', '1000px')
            container.find('.arrow').css('transform', 'rotateX(180deg)')
            parent.find('.time-container').show()
            parent.addClass('opened')
        }
    }
});
