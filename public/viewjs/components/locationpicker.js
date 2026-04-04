Grocy.Components.LocationPicker = {};
Grocy.Components.LocationPicker._tsInstance = null;

Grocy.Components.LocationPicker.GetPicker = function()
{
	return $('#location_id');
}

Grocy.Components.LocationPicker.GetInputElement = function()
{
	return $(Grocy.Components.LocationPicker._tsInstance.control_input);
}

Grocy.Components.LocationPicker.GetValue = function()
{
	return $('#location_id').val();
}

Grocy.Components.LocationPicker.SetValue = function(value)
{
	Grocy.Components.LocationPicker._tsInstance.setTextboxValue(value);
	$(Grocy.Components.LocationPicker._tsInstance.control_input).trigger('change');
}

Grocy.Components.LocationPicker.SetId = function(value)
{
	if (value === null || value === '' || value === undefined)
	{
		Grocy.Components.LocationPicker._tsInstance.clear(true);
	}
	else
	{
		Grocy.Components.LocationPicker._tsInstance.setValue(String(value), true);
	}
	Grocy.Components.LocationPicker.GetPicker().trigger('change');
}

Grocy.Components.LocationPicker.Clear = function()
{
	Grocy.Components.LocationPicker.SetValue('');
	Grocy.Components.LocationPicker.SetId(null);
}

Grocy.Components.LocationPicker._tsInstance = new TomSelect('#location_id', {
	allowEmptyOption: true,
	create: false
});

var prefillByName = Grocy.Components.LocationPicker.GetPicker().parent().data('prefill-by-name').toString();
if (typeof prefillByName !== "undefined")
{
	possibleOptionElement = $("#location_id option:contains(\"" + prefillByName + "\")").first();

	if (possibleOptionElement.length > 0)
	{
		Grocy.Components.LocationPicker._tsInstance.setValue(possibleOptionElement.val(), true);
		$('#location_id').trigger('change');

		var nextInputElement = $(Grocy.Components.LocationPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillById = Grocy.Components.LocationPicker.GetPicker().parent().data('prefill-by-id').toString();
if (typeof prefillById !== "undefined")
{
	Grocy.Components.LocationPicker._tsInstance.setValue(prefillById, true);
	$('#location_id').trigger('change');

	var nextInputElement = $(Grocy.Components.LocationPicker.GetPicker().parent().data('next-input-selector').toString());
	nextInputElement.focus();
}
