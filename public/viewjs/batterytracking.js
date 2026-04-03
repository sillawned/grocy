var tsBattery = null;

$('#save-batterytracking-button').on('click', function(e)
{
	e.preventDefault();

	if (!Grocy.FrontendHelpers.ValidateForm("batterytracking-form", true))
	{
		return;
	}

	if ($(".ts-wrapper.dropdown-active").length)
	{
		return;
	}

	var jsonForm = $('#batterytracking-form').serializeJSON();
	Grocy.FrontendHelpers.BeginUiBusy("batterytracking-form");

	Grocy.Api.Get('batteries/' + jsonForm.battery_id,
		function(batteryDetails)
		{
			Grocy.Api.Post('batteries/' + jsonForm.battery_id + '/charge', { 'tracked_time': $('#tracked_time').find('input').val() },
				function(result)
				{
					Grocy.EditObjectId = result.id;
					Grocy.Components.UserfieldsForm.Save(function()
					{
						Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
						toastr.success(__t('Tracked charge cycle of battery %1$s on %2$s', batteryDetails.battery.name, $('#tracked_time').find('input').val()) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoChargeCycle(' + result.id + ')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>');
						Grocy.Components.BatteryCard.Refresh($('#battery_id').val());

						tsBattery.clear(true);
						$('#tracked_time').find('input').val(moment().format('YYYY-MM-DD HH:mm:ss'));
						$('#battery_id').trigger('change');
						Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
						$(tsBattery.control_input).focus();
					});
				},
				function(xhr)
				{
					Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
					console.error(xhr);
				}
			);
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
			console.error(xhr);
		}
	);
});

$('#battery_id').on('change', function(e)
{
	var batteryId = $(e.target).val();
	if (batteryId)
	{
		Grocy.Components.BatteryCard.Refresh(batteryId);

		setTimeout(function()
		{
			$('#tracked_time').find('input').focus();
		}, Grocy.FormFocusDelay);

		Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
	}
});

tsBattery = new TomSelect('#battery_id', {
	allowEmptyOption: true,
	create: false,
	onBlur: function()
	{
		if (tsBattery.isOpen)
		{
			return;
		}

		var input = tsBattery.control_input.value.toString();
		var possibleOptionElement = [];

		// Grocycode handling
		if (input.startsWith("grcy"))
		{
			var gc = input.split(":");
			if (gc[1] == "b")
			{
				possibleOptionElement = $("#battery_id option[value=\"" + gc[2] + "\"]").first();
			}

			if (possibleOptionElement.length > 0)
			{
				tsBattery.setValue(possibleOptionElement.val(), true);
				$('#battery_id').trigger('change');
			}
			else
			{
				tsBattery.clear(true);
				tsBattery.setTextboxValue('');
				$('#battery_id').trigger('change');
			}
		}
	}
});

tsBattery.clear(true);
$(tsBattery.control_input).trigger('change');
Grocy.Components.DateTimePicker.GetInputElement().trigger('input');
Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
setTimeout(function()
{
	$(tsBattery.control_input).focus();
}, Grocy.FormFocusDelay);

$('#batterytracking-form input').keyup(function(event)
{
	Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
});

$('#batterytracking-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Grocy.FrontendHelpers.ValidateForm('batterytracking-form'))
		{
			return false;
		}
		else
		{
			$('#save-batterytracking-button').click();
		}
	}
});

$('#tracked_time').find('input').on('keypress', function(e)
{
	Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
});

$(document).on("Grocy.BarcodeScanned", function(e, barcode, target)
{
	if (!(target == "@batterypicker" || target == "undefined" || target == undefined)) // Default target
	{
		return;
	}

	// Don't know why the blur event does not fire immediately ... this works...
	$(tsBattery.control_input).focusout();
	$(tsBattery.control_input).focus();
	$(tsBattery.control_input).blur();

	tsBattery.setTextboxValue(barcode);

	setTimeout(function()
	{
		$(tsBattery.control_input).focusout();
		$(tsBattery.control_input).focus();
		$(tsBattery.control_input).blur();
		$('#tracked_time').find('input').focus();
	}, Grocy.FormFocusDelay);
});

function UndoChargeCycle(chargeCycleId)
{
	Grocy.Api.Post('batteries/charge-cycles/' + chargeCycleId.toString() + '/undo', {},
		function(result)
		{
			toastr.success(__t("Charge cycle successfully undone"));
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
};

$("#tracked_time").find("input").on("focus", function(e)
{
	$(this).select();
});
