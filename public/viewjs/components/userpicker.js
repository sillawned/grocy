Grocy.Components.UserPicker = {};
Grocy.Components.UserPicker._tsInstance = null;

Grocy.Components.UserPicker.GetPicker = function()
{
	return $('#user_id');
}

Grocy.Components.UserPicker.GetInputElement = function()
{
	return $(Grocy.Components.UserPicker._tsInstance.control_input);
}

Grocy.Components.UserPicker.GetValue = function()
{
	return $('#user_id').val();
}

Grocy.Components.UserPicker.SetValue = function(value)
{
	Grocy.Components.UserPicker._tsInstance.setTextboxValue(value);
	$(Grocy.Components.UserPicker._tsInstance.control_input).trigger('change');
}

Grocy.Components.UserPicker.SetId = function(value)
{
	if (value === null || value === '' || value === undefined)
	{
		Grocy.Components.UserPicker._tsInstance.clear(true);
	}
	else
	{
		Grocy.Components.UserPicker._tsInstance.setValue(String(value), true);
	}
	Grocy.Components.UserPicker.GetPicker().trigger('change');
}

Grocy.Components.UserPicker.Clear = function()
{
	Grocy.Components.UserPicker.SetValue('');
	Grocy.Components.UserPicker.SetId(null);
}

Grocy.Components.UserPicker._tsInstance = new TomSelect('#user_id', {
	allowEmptyOption: true,
	create: false
});

var prefillUser = Grocy.Components.UserPicker.GetPicker().parent().data('prefill-by-username').toString();
if (typeof prefillUser !== "undefined")
{
	var possibleOptionElement = $("#user_id option[data-additional-searchdata*=\"" + prefillUser + "\"]").first();
	if (possibleOptionElement.length === 0)
	{
		possibleOptionElement = $("#user_id option:contains(\"" + prefillUser + "\")").first();
	}

	if (possibleOptionElement.length > 0)
	{
		Grocy.Components.UserPicker._tsInstance.setValue(possibleOptionElement.val(), true);
		$('#user_id').trigger('change');

		var nextInputElement = $(Grocy.Components.UserPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillUserId = Grocy.Components.UserPicker.GetPicker().parent().data('prefill-by-user-id').toString();
if (typeof prefillUserId !== "undefined")
{
	var possibleOptionElement = $("#user_id option[value='" + prefillUserId + "']").first();
	if (possibleOptionElement.length > 0)
	{
		Grocy.Components.UserPicker._tsInstance.setValue(possibleOptionElement.val(), true);
		$('#user_id').trigger('change');

		var nextInputElement = $(Grocy.Components.UserPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}
