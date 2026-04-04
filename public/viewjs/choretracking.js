var tsChore = null;

$('.save-choretracking-button').on('click', function(e)
{
	e.preventDefault();

	if (!Grocy.FrontendHelpers.ValidateForm("choretracking-form", true))
	{
		return;
	}

	if ($(".ts-wrapper.dropdown-active").length)
	{
		return;
	}

	var skipped = $(e.currentTarget).hasClass("skip");

	var jsonForm = $('#choretracking-form').serializeJSON();
	Grocy.FrontendHelpers.BeginUiBusy("choretracking-form");

	Grocy.Api.Get('chores/' + jsonForm.chore_id,
		function(choreDetails)
		{
			Grocy.Api.Post('chores/' + jsonForm.chore_id + '/execute', { 'tracked_time': Grocy.Components.DateTimePicker.GetValue(), 'done_by': $("#user_id").val(), 'skipped': skipped },
				function(result)
				{
					Grocy.EditObjectId = result.id;
					Grocy.Components.UserfieldsForm.Save(function()
					{
						Grocy.FrontendHelpers.EndUiBusy("choretracking-form");
						toastr.success(__t('Tracked execution of chore %1$s on %2$s', choreDetails.chore.name, Grocy.Components.DateTimePicker.GetValue()) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoChoreExecution(' + result.id + ')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>');
						Grocy.Components.ChoreCard.Refresh($('#chore_id').val());

						tsChore.clear(true);
						Grocy.Components.DateTimePicker.SetValue(moment().format('YYYY-MM-DD HH:mm:ss'));
						$('#chore_id').trigger('change');
						Grocy.FrontendHelpers.ValidateForm('choretracking-form');
						$(tsChore.control_input).focus();
					});
				},
				function(xhr)
				{
					Grocy.FrontendHelpers.EndUiBusy("choretracking-form");
					console.error(xhr);
				}
			);
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.EndUiBusy("choretracking-form");
			console.error(xhr);
		}
	);
});

$('#chore_id').on('change', function(e)
{
	var choreId = $(e.target).val();
	if (choreId)
	{
		Grocy.Api.Get('objects/chores/' + choreId,
			function(chore)
			{

				if (chore.track_date_only == 1)
				{
					Grocy.Components.DateTimePicker.ChangeFormat("YYYY-MM-DD");
					Grocy.Components.DateTimePicker.SetValue(moment().format("YYYY-MM-DD"));
				}
				else
				{
					Grocy.Components.DateTimePicker.ChangeFormat("YYYY-MM-DD HH:mm:ss");
					Grocy.Components.DateTimePicker.SetValue(moment().format("YYYY-MM-DD HH:mm:ss"));
				}

				if (chore.period_type == "manually")
				{
					$(".save-choretracking-button.skip").addClass("disabled");
				}
				else
				{
					$(".save-choretracking-button.skip").removeClass("disabled");
				}

				Grocy.FrontendHelpers.ValidateForm('choretracking-form');
			},
			function(xhr)
			{
				console.error(xhr);
			}
		);

		Grocy.Components.ChoreCard.Refresh(choreId);

		setTimeout(function()
		{
			Grocy.Components.DateTimePicker.GetInputElement().focus();
		}, Grocy.FormFocusDelay);

		Grocy.FrontendHelpers.ValidateForm('choretracking-form');
	}
});

tsChore = new TomSelect('#chore_id', {
	allowEmptyOption: true,
	create: false,
	onBlur: function()
	{
		if (tsChore.isOpen)
		{
			return;
		}

		var input = tsChore.control_input.value.toString();
		var possibleOptionElement = [];

		// Grocycode handling
		if (input.startsWith("grcy"))
		{
			var gc = input.split(":");
			if (gc[1] == "c")
			{
				possibleOptionElement = $("#chore_id option[value=\"" + gc[2] + "\"]").first();
			}

			if (possibleOptionElement.length > 0)
			{
				tsChore.setValue(possibleOptionElement.val(), true);
				$('#chore_id').trigger('change');
			}
			else
			{
				tsChore.clear(true);
				tsChore.setTextboxValue('');
				$('#chore_id').trigger('change');
			}
		}
	}
});

$(tsChore.control_input).trigger('change');
Grocy.Components.DateTimePicker.GetInputElement().trigger('input');
Grocy.FrontendHelpers.ValidateForm('choretracking-form');
setTimeout(function()
{
	$(tsChore.control_input).focus();
}, Grocy.FormFocusDelay);

$('#choretracking-form input').keyup(function(event)
{
	Grocy.FrontendHelpers.ValidateForm('choretracking-form');
});

$('#choretracking-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Grocy.FrontendHelpers.ValidateForm('choretracking-form'))
		{
			return false;
		}
		else
		{
			$('.save-choretracking-button').first().click();
		}
	}
});

$(document).on("Grocy.BarcodeScanned", function(e, barcode, target)
{
	if (!(target == "@chorepicker" || target == "undefined" || target == undefined)) // Default target
	{
		return;
	}

	// Don't know why the blur event does not fire immediately ... this works...
	$(tsChore.control_input).focusout();
	$(tsChore.control_input).focus();
	$(tsChore.control_input).blur();

	tsChore.setTextboxValue(barcode);

	setTimeout(function()
	{
		$(tsChore.control_input).focusout();
		$(tsChore.control_input).focus();
		$(tsChore.control_input).blur();
		$('#tracked_time').find('input').focus();
	}, Grocy.FormFocusDelay);
});

Grocy.Components.DateTimePicker.GetInputElement().on('keypress', function(e)
{
	Grocy.FrontendHelpers.ValidateForm('choretracking-form');
});

function UndoChoreExecution(executionId)
{
	Grocy.Api.Post('chores/executions/' + executionId.toString() + '/undo', {},
		function(result)
		{
			toastr.success(__t("Chore execution successfully undone"));
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
