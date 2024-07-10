// static/scripts.js
$(document).ready(function() {

    let masters = [];
    let services = [];
    let cart_services = [];

    if (window.matchMedia("(min-width: 768px)").matches) {
        $.bsCalendar.setDefault('width', '400px');
        $('#example').bsCalendar('refresh');
        $('#example').css('width', '100%')
    } else {
        $.bsCalendar.setDefault('width', '300px');
        $('#example').bsCalendar('refresh');
        $('#example').css('width', '100%')
    }

    function fetchMasters() {
        $.ajax({
            url: '/masters',
            method: 'GET',
            success: function(data) {
                masters = [];
                masters = data;
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
    })

    $('#picMaster').on('click', function () {
        $('#home-form').hide();
        $('.back-arrow').show();
        $('#masters-form').show();
    });
    $('#picService').on('click', function () {
        fetchServices(function () {
            $('#home-form').hide();
            $('.back-arrow').show();
            $('#services-form').show();
            var servicesContainer = $('#services-container')
            servicesContainer.empty();
            var counter = 0;
            services.forEach(service => {
                var div = $('<div class="form-row">');
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
    });

    $(document).on('updateCart', function () {
        //console.log(cart_services)
        var cart = $('#cart');
        var modalCartContainer = $('#modalCartContainer');
        modalCartContainer.empty();
        cart.empty();
        if(cart_services.length == 0) {
            cart.hide();
        } else {
            cart.show();
            var header = $('<div style="display: flex; align-items: center;">')
            var end = cart_services.length == 1 || cart_services.length >= 5 ? '' : 'и';
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
            var totalPrice = $(`<span><strong>${price} ₽</strong></span>`)
            var editImg = $('<img style="margin-left: 5px;" src="../static/icons/edit.svg">')
            div.append(totalPrice, editImg)
            header.append(count, duration, div);
            header.on('click', function () {
                $('#editCartModal').modal('show')
            })
            var btn = $('<button class="btn btn-success nextMaster">Выбрать специалиста</button>')
            cart.append(header, btn)
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
