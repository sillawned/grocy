Grocy.Components.DateTimePicker2 = {};
Grocy.Components.DateTimePicker2._fpInstance = null;

Grocy.Components.DateTimePicker2.GetInputElement = function()
{
	return $('.datetimepicker2').find('input').not(".form-check-input");
}

Grocy.Components.DateTimePicker2.GetValue = function()
{
	return Grocy.Components.DateTimePicker2.GetInputElement().val();
}

Grocy.Components.DateTimePicker2.SetValue = function(value, inputElement = Grocy.Components.DateTimePicker2.GetInputElement())
{
	// "Click" the shortcut checkbox when the desired value is
	// not the shortcut value and it is currently set
	var shortcutValue = $("#datetimepicker2-shortcut").data("datetimepicker-shortcut-value");
	if (value != shortcutValue && $("#datetimepicker2-shortcut").is(":checked"))
	{
		$("#datetimepicker2-shortcut").click();
	}
	inputElement.val(value);
	inputElement.keyup();
}

Grocy.Components.DateTimePicker2.Clear = function()
{
	Grocy.Components.DateTimePicker2.Init(true);

	Grocy.Components.DateTimePicker2.GetInputElement().val("");

	// "Click" the shortcut checkbox when the desired value is
	// not the shortcut value and it is currently set
	value = "";
	var shortcutValue = $("#datetimepicker2-shortcut").data("datetimepicker2-shortcut-value");
	if (value != shortcutValue && $("#datetimepicker2-shortcut").is(":checked"))
	{
		$("#datetimepicker2-shortcut").click();
	}

	$('#datetimepicker2-timeago').text('');
}

Grocy.Components.DateTimePicker2.ChangeFormat = function(format)
{
	if (Grocy.Components.DateTimePicker2._fpInstance)
	{
		Grocy.Components.DateTimePicker2._fpInstance.destroy();
		Grocy.Components.DateTimePicker2._fpInstance = null;
	}
	Grocy.Components.DateTimePicker2.GetInputElement().data("format", format);
	Grocy.Components.DateTimePicker2.Init();

	if (format == "YYYY-MM-DD")
	{
		Grocy.Components.DateTimePicker2.GetInputElement().addClass("date-only-datetimepicker2");
	}
	else
	{
		Grocy.Components.DateTimePicker2.GetInputElement().removeClass("date-only-datetimepicker2");
	}
}

var startDate = null;
if (Grocy.Components.DateTimePicker2.GetInputElement().data('init-with-now') === true)
{
	startDate = moment().format(Grocy.Components.DateTimePicker2.GetInputElement().data('format'));
}
if (Grocy.Components.DateTimePicker2.GetInputElement().data('init-value').length > 0)
{
	startDate = moment(Grocy.Components.DateTimePicker2.GetInputElement().data('init-value')).format(Grocy.Components.DateTimePicker2.GetInputElement().data('format'));
}

var limitDate = moment('2999-12-31 23:59:59').toDate();
if (Grocy.Components.DateTimePicker2.GetInputElement().data('limit-end-to-now') === true)
{
	limitDate = moment().toDate();
}

Grocy.Components.DateTimePicker2.Init = function(reInit = false)
{
	if (reInit && Grocy.Components.DateTimePicker2._fpInstance)
	{
		Grocy.Components.DateTimePicker2._fpInstance.destroy();
		Grocy.Components.DateTimePicker2._fpInstance = null;
	}

	var format = Grocy.Components.DateTimePicker2.GetInputElement().data('format');
	var enableTime = format.indexOf('HH') !== -1;
	var fpFormat = format
		.replace('YYYY', 'Y')
		.replace('MM', 'm')
		.replace('DD', 'd')
		.replace('HH', 'H')
		.replace('mm', 'i')
		.replace('ss', 'S');

	var fpLocale = (typeof Grocy.FlatpickrLocale !== 'undefined' && Grocy.FlatpickrLocale && Grocy.FlatpickrLocale !== 'x' && flatpickr.l10ns[Grocy.FlatpickrLocale])
		? flatpickr.l10ns[Grocy.FlatpickrLocale]
		: flatpickr.l10ns.default;

	Grocy.Components.DateTimePicker2._fpInstance = flatpickr(".datetimepicker2", {
		wrap: true,
		dateFormat: fpFormat,
		enableTime: enableTime,
		time_24hr: true,
		weekNumbers: Grocy.CalendarShowWeekNumbers,
		maxDate: limitDate,
		defaultDate: startDate,
		locale: fpLocale,
		allowInput: true,
		onChange: function(selectedDates, dateStr, instance)
		{
			Grocy.Components.DateTimePicker2.GetInputElement().trigger('input');
		},
		onClose: function(selectedDates, dateStr, instance)
		{
			Grocy.Components.DateTimePicker2.GetInputElement().trigger('input');
			Grocy.Components.DateTimePicker2.GetInputElement().trigger('change');
			Grocy.Components.DateTimePicker2.GetInputElement().trigger('keypress');
			Grocy.Components.DateTimePicker2.GetInputElement().trigger('keyup');
		}
	});
}
Grocy.Components.DateTimePicker2.Init();

Grocy.Components.DateTimePicker2.GetInputElement().on('keyup', function(e)
{
	if (Grocy.Components.DateTimePicker2._fpInstance)
	{
		Grocy.Components.DateTimePicker2._fpInstance.close();
	}

	var inputElement = $(e.currentTarget)
	var value = inputElement.val();
	var format = inputElement.data('format');
	var nextInputElement = $(inputElement.data('next-input-selector'));

	if (!nextInputElement.is("input"))
	{
		nextInputElement = nextInputElement.find("input");
	}

	// If input is empty and any arrow key is pressed, set date to today
	if (value.length === 0 && (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 37 || e.keyCode === 39))
	{
		Grocy.Components.DateTimePicker2.SetValue(moment(new Date(), format, true).format(format), inputElement);
		nextInputElement.focus();
	}
	else if (value === 'x' || value === 'X') // Shorthand for never overdue
	{
		Grocy.Components.DateTimePicker2.SetValue(moment('2999-12-31 23:59:59').format(format), inputElement);
		nextInputElement.focus();
	}
	else if ((value.startsWith("+") || value.startsWith("-"))) // Shorthand for [+/-]n[d/m/y]
	{
		var lastCharacter = value.slice(-1).toLowerCase();

		if (lastCharacter == "d" || lastCharacter == "m" || lastCharacter == "y")
		{
			var n = Number.parseInt(value.substring(1, value.length - 1));
			if (value.startsWith("-"))
			{
				n = n * -1;
			}

			if (lastCharacter == "d")
			{
				Grocy.Components.DateTimePicker2.SetValue(moment().add(n, "days").format(format));
				nextInputElement.focus();
			}
			else if (lastCharacter == "m")
			{
				Grocy.Components.DateTimePicker2.SetValue(moment().add(n, "months").format(format));
				nextInputElement.focus();
			}
			else if (lastCharacter == "y")
			{
				Grocy.Components.DateTimePicker2.SetValue(moment().add(n, "years").format(format));
				nextInputElement.focus();
			}
		}
	}
	else if (value.length === 4 && $.isNumeric(value) && Number.parseInt(value.substring(0, 2)) >= 1 && Number.parseInt(value.substring(0, 2)) <= 12) // Shorthand for MMDD
	{
		var date = moment((new Date()).getFullYear().toString() + value);
		if (date.isBefore(moment()))
		{
			date.add(1, "year");
		}
		Grocy.Components.DateTimePicker2.SetValue(date.format(format), inputElement);
		nextInputElement.focus();
	}
	else if (value.length === 8 && $.isNumeric(value)) // Shorthand for YYYYMMDD
	{
		Grocy.Components.DateTimePicker2.SetValue(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'), inputElement);
		nextInputElement.focus();
	}
	else if (value.length === 7 && $.isNumeric(value.substring(0, 6)) && (value.substring(6, 7).toLowerCase() === "e" || value.substring(6, 7) === "+")) // Shorthand for YYYYMM[e/+]
	{
		var date = moment(value.substring(0, 4) + "-" + value.substring(4, 6) + "-01").endOf("month");
		Grocy.Components.DateTimePicker2.SetValue(date.format(format), inputElement);
		nextInputElement.focus();
	}
	else
	{
		var dateObj = moment(value, format, true);
		if (dateObj.isValid())
		{
			if (e.shiftKey)
			{
				// WITH shift modifier key

				if (e.keyCode === 38) // Up
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(-1, 'months').format(format), inputElement);
				}
				else if (e.keyCode === 40) // Down
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(1, 'months').format(format), inputElement);
				}
				else if (e.keyCode === 37) // Left
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(-1, 'years').format(format), inputElement);
				}
				else if (e.keyCode === 39) // Right
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(1, 'years').format(format), inputElement);
				}
			}
			else
			{
				// WITHOUT shift modifier key

				if (e.keyCode === 38) // Up
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(-1, 'days').format(format), inputElement);
				}
				else if (e.keyCode === 40) // Down
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(1, 'days').format(format), inputElement);
				}
				else if (e.keyCode === 37) // Left
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(-1, 'weeks').format(format), inputElement);
				}
				else if (e.keyCode === 39) // Right
				{
					Grocy.Components.DateTimePicker2.SetValue(dateObj.add(1, 'weeks').format(format), inputElement);
				}
			}
		}
	}

	$('#datetimepicker2-timeago').attr("datetime", Grocy.Components.DateTimePicker2.GetValue());
	RefreshContextualTimeago(".datetimepicker2-wrapper");

	//Custom validation
	value = Grocy.Components.DateTimePicker2.GetValue();
	dateObj = moment(value, format, true);
	var element = Grocy.Components.DateTimePicker2.GetInputElement()[0];
	if (!dateObj.isValid())
	{
		if ($(element).hasAttr("required"))
		{
			element.setCustomValidity("error");
		}
	}
	else
	{
		if (Grocy.Components.DateTimePicker2.GetInputElement().data('limit-end-to-now') === true && dateObj.isAfter(moment()))
		{
			element.setCustomValidity("error");
		}
		else if (Grocy.Components.DateTimePicker2.GetInputElement().data('limit-start-to-now') === true && dateObj.isBefore(moment()))
		{
			element.setCustomValidity("error");
		}
		else
		{
			element.setCustomValidity("");
		}

		var earlierThanLimit = Grocy.Components.DateTimePicker2.GetInputElement().data("earlier-than-limit");
		if (earlierThanLimit)
		{
			if (moment(value).isBefore(moment(earlierThanLimit)))
			{
				$("#datetimepicker2-earlier-than-info").removeClass("hidden");
			}
			else
			{
				$("#datetimepicker2-earlier-than-info").addClass("hidden");
			}
		}
	}

	// "Click" the shortcut checkbox when the shortcut value was
	// entered manually and it is currently not set
	var shortcutValue = $("#datetimepicker2-shortcut").data("datetimepicker2-shortcut-value");
	if (value == shortcutValue && !$("#datetimepicker2-shortcut").is(":checked"))
	{
		$("#datetimepicker2-shortcut").click();
	}
});

Grocy.Components.DateTimePicker2.GetInputElement().on('input', function(e)
{
	$('#datetimepicker2-timeago').attr("datetime", Grocy.Components.DateTimePicker2.GetValue());
	RefreshContextualTimeago(".datetimepicker2-wrapper");
});

$("#datetimepicker2-shortcut").on("click", function()
{
	if (this.checked)
	{
		var value = $("#datetimepicker2-shortcut").data("datetimepicker2-shortcut-value");
		Grocy.Components.DateTimePicker2.SetValue(value);
		Grocy.Components.DateTimePicker2.GetInputElement().attr("readonly", "");
		$(Grocy.Components.DateTimePicker2.GetInputElement().data('next-input-selector')).focus();
	}
	else
	{
		Grocy.Components.DateTimePicker2.SetValue("");
		Grocy.Components.DateTimePicker2.GetInputElement().removeAttr("readonly");
		Grocy.Components.DateTimePicker2.GetInputElement().focus();
	}

	Grocy.Components.DateTimePicker2.GetInputElement().trigger('input');
	Grocy.Components.DateTimePicker2.GetInputElement().trigger('change');
	Grocy.Components.DateTimePicker2.GetInputElement().trigger('keypress');
});
