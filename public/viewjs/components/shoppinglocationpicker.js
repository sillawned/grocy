Grocy.Components.ShoppingLocationPicker = {};
Grocy.Components.ShoppingLocationPicker._tsInstance = null;

Grocy.Components.ShoppingLocationPicker.GetPicker = function()
{
	return $('#shopping_location_id');
}

Grocy.Components.ShoppingLocationPicker.GetInputElement = function()
{
	return $(Grocy.Components.ShoppingLocationPicker._tsInstance.control_input);
}

Grocy.Components.ShoppingLocationPicker.GetValue = function()
{
	return $('#shopping_location_id').val();
}

Grocy.Components.ShoppingLocationPicker.SetValue = function(value)
{
	Grocy.Components.ShoppingLocationPicker._tsInstance.setTextboxValue(value);
	$(Grocy.Components.ShoppingLocationPicker._tsInstance.control_input).trigger('change');
}

Grocy.Components.ShoppingLocationPicker.SetId = function(value)
{
	if (value === null || value === '' || value === undefined)
	{
		Grocy.Components.ShoppingLocationPicker._tsInstance.clear(true);
	}
	else
	{
		Grocy.Components.ShoppingLocationPicker._tsInstance.setValue(String(value), true);
	}
	Grocy.Components.ShoppingLocationPicker.GetPicker().trigger('change');
}

Grocy.Components.ShoppingLocationPicker.Clear = function()
{
	Grocy.Components.ShoppingLocationPicker.SetValue('');
	Grocy.Components.ShoppingLocationPicker.SetId(null);
}

Grocy.Components.ShoppingLocationPicker._tsInstance = new TomSelect('#shopping_location_id', {
	allowEmptyOption: true,
	create: false
});

var prefillByName = Grocy.Components.ShoppingLocationPicker.GetPicker().parent().data('prefill-by-name').toString();
if (typeof prefillByName !== "undefined")
{
	possibleOptionElement = $("#shopping_location_id option:contains(\"" + prefillByName + "\")").first();

	if (possibleOptionElement.length > 0)
	{
		Grocy.Components.ShoppingLocationPicker._tsInstance.setValue(possibleOptionElement.val(), true);
		$('#shopping_location_id').trigger('change');

		var nextInputElement = $(Grocy.Components.ShoppingLocationPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillById = Grocy.Components.ShoppingLocationPicker.GetPicker().parent().data('prefill-by-id').toString();
if (typeof prefillById !== "undefined")
{
	Grocy.Components.ShoppingLocationPicker._tsInstance.setValue(prefillById, true);
	$('#shopping_location_id').trigger('change');

	var nextInputElement = $(Grocy.Components.ShoppingLocationPicker.GetPicker().parent().data('next-input-selector').toString());
	nextInputElement.focus();
}
