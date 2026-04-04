var fpLocale = (typeof Grocy.FlatpickrLocale !== 'undefined' && Grocy.FlatpickrLocale && Grocy.FlatpickrLocale !== 'x' && flatpickr.l10ns[Grocy.FlatpickrLocale])
	? flatpickr.l10ns[Grocy.FlatpickrLocale]
	: flatpickr.l10ns.default;

flatpickr('#calendar', {
	inline: true,
	weekNumbers: true,
	locale: fpLocale
});
