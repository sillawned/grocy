Grocy.Components.RecipePicker = {};
Grocy.Components.RecipePicker._tsInstance = null;

Grocy.Components.RecipePicker.GetPicker = function()
{
	return $('#recipe_id');
}

Grocy.Components.RecipePicker.GetInputElement = function()
{
	return $(Grocy.Components.RecipePicker._tsInstance.control_input);
}

Grocy.Components.RecipePicker.GetValue = function()
{
	return $('#recipe_id').val();
}

Grocy.Components.RecipePicker.SetValue = function(value)
{
	Grocy.Components.RecipePicker._tsInstance.setTextboxValue(value);
	$(Grocy.Components.RecipePicker._tsInstance.control_input).trigger('change');
}

Grocy.Components.RecipePicker.SetId = function(value)
{
	if (value === null || value === '' || value === undefined)
	{
		Grocy.Components.RecipePicker._tsInstance.clear(true);
	}
	else
	{
		Grocy.Components.RecipePicker._tsInstance.setValue(String(value), true);
	}
	Grocy.Components.RecipePicker.GetPicker().trigger('change');
}

Grocy.Components.RecipePicker.Clear = function()
{
	Grocy.Components.RecipePicker.SetValue('');
	Grocy.Components.RecipePicker.SetId(null);
}

Grocy.Components.RecipePicker._tsInstance = new TomSelect('#recipe_id', {
	allowEmptyOption: true,
	create: false,
	onBlur: function()
	{
		if (Grocy.Components.RecipePicker._tsInstance.isOpen)
		{
			return;
		}

		var input = Grocy.Components.RecipePicker._tsInstance.control_input.value.toString();
		var possibleOptionElement = [];

		// Grocycode handling
		if (input.startsWith("grcy"))
		{
			var gc = input.split(":");
			if (gc[1] == "r")
			{
				possibleOptionElement = $("#recipe_id option[value=\"" + gc[2] + "\"]").first();
			}

			if (possibleOptionElement.length > 0)
			{
				Grocy.Components.RecipePicker._tsInstance.setValue(possibleOptionElement.val(), true);
				$('#recipe_id').trigger('change');
			}
			else
			{
				Grocy.Components.RecipePicker._tsInstance.clear(true);
				Grocy.Components.RecipePicker._tsInstance.setTextboxValue('');
				$('#recipe_id').trigger('change');
			}
		}
	}
});

var prefillByName = Grocy.Components.RecipePicker.GetPicker().parent().data('prefill-by-name').toString();
if (typeof prefillByName !== "undefined")
{
	possibleOptionElement = $("#recipe_id option:contains(\"" + prefillByName + "\")").first();

	if (possibleOptionElement.length > 0)
	{
		Grocy.Components.RecipePicker._tsInstance.setValue(possibleOptionElement.val(), true);
		$('#recipe_id').trigger('change');

		var nextInputElement = $(Grocy.Components.RecipePicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillById = Grocy.Components.RecipePicker.GetPicker().parent().data('prefill-by-id').toString();
if (typeof prefillById !== "undefined")
{
	Grocy.Components.RecipePicker._tsInstance.setValue(prefillById, true);
	$('#recipe_id').trigger('change');

	var nextInputElement = $(Grocy.Components.RecipePicker.GetPicker().parent().data('next-input-selector').toString());
	nextInputElement.focus();
}

$(document).on("Grocy.BarcodeScanned", function(e, barcode, target)
{
	if (!(target == "@recipepicker" || target == "undefined" || target == undefined)) // Default target
	{
		return;
	}

	// Don't know why the blur event does not fire immediately ... this works...
	Grocy.Components.RecipePicker.GetInputElement().focusout();
	Grocy.Components.RecipePicker.GetInputElement().focus();
	Grocy.Components.RecipePicker.GetInputElement().blur();

	Grocy.Components.RecipePicker._tsInstance.setTextboxValue(barcode);

	setTimeout(function()
	{
		Grocy.Components.RecipePicker.GetInputElement().focusout();
		Grocy.Components.RecipePicker.GetInputElement().focus();
		Grocy.Components.RecipePicker.GetInputElement().blur();
	}, Grocy.FormFocusDelay);
});
