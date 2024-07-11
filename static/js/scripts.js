// static/scripts.js
$(document).ready(function() {

    let masters = [];
    let services = [];
    let masters_difficult = []
    let cart_services = [];
    let final_cart = {};

    if (window.matchMedia("(min-width: 768px)").matches) {
        $.bsCalendar.setDefault('width', '400px');
        $('#example').bsCalendar('refresh');
        $('#example').css('width', '100%')
    } else {
        $.bsCalendar.setDefault('width', '300px');
        $('#example').bsCalendar('refresh');
        $('#example').css('width', '100%')
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

    function fetchAvailableDates() {
        const masterId = $('#masters').val();
        const serviceId = $('#services').val();
        $.ajax({
            url: '/available-dates',
            method: 'GET',
            data: { master_id: masterId, service_id: serviceId },
            success: function(data) {
                const datesSelect = $('#dates');
                datesSelect.empty().append('<option value="">--Выберите дату--</option>');
                data.forEach(function(date) {
                    datesSelect.append(`<option value="${date.date}">${date.date}</option>`);
                });
                $('#step3').show();
            }
        });
    }

    function fetchAvailableTimes() {
        const masterId = $('#masters').val();
        const serviceId = $('#services').val();
        const date = $('#dates').val();
        $.ajax({
            url: '/available-times',
            method: 'GET',
            data: { master_id: masterId, service_id: serviceId, date: date },
            success: function(data) {
                const timesSelect = $('#times');
                timesSelect.empty().append('<option value="">--Выберите время--</option>');
                data.forEach(function(time) {
                    timesSelect.append(`<option value="${time.time}">${time.time}</option>`);
                });
                timesSelect.show();
                $('#client-info').show();
            }
        });
    }

    function bookAppointment() {
        const masterId = $('#masters').val();
        const serviceId = $('#services').val();
        const date = $('#dates').val();
        const time = $('#times').val();
        const clientName = $('#client-name').val();
        const clientPhone = $('#client-phone').val();

        if (masterId && serviceId && date && time && clientName && clientPhone) {
            $.ajax({
                url: '/book',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    master_id: masterId,
                    service_id: serviceId,
                    date: date,
                    time: time,
                    client_name: clientName,
                    client_phone: clientPhone
                }),
                success: function(response) {
                    alert(response.message);
                }
            });
        } else {
            alert('Пожалуйста, заполните все поля.');
        }
    }

    $('.back-arrow').on('click', function () {
        $(this).hide()
        $('#masters-form').hide();
        $('#services-form').hide();
        $('#dates-form').hide();
        $('#home-form').show();
        final_cart = {};
        cart_services = [];
        $('#cart').hide()
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
        if(final_cart.hasOwnProperty('master') && final_cart.hasOwnProperty('service'))
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

    $('.cartBtn').on('click', function () {
        if(final_cart.hasOwnProperty('master') && final_cart.hasOwnProperty('service')) {
            $('#dates-form').show();
            $('#masters-form').hide();
            $('#services-form').hide();
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
        console.log('hi')
    })
});
