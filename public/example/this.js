/*jslint browser: true, regexp: true */
/*global jQuery, $ */

$(function () {
	'use strict';

	// Deck initialization
	$.deck('.slide');
	$.deck('remote', {
		server: location.protocol + '//' + location.hostname,
		port: location.port || 80
	});
});