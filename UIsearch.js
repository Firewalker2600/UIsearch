(
	function (nsObj, undefined) {
		let $ = jQuery;
		const keyA = "2c32bf3eb06b30af5f8208481aea3e8b"; //demo key
		const keyB = "f599f68840eadc23261239307f05ab24"; //test key
		const keyC = "638cf5af3a1030ba2ff3fe9b5cdd828a"; //prod key
		const interval = 500;
		const limit = 10;
		const about_limit = 40;
		let typingTimer;
		let currentPage = 1;
		let total = 0;
		let url;
		let loading = false;
		const client = new AddSearchClient(keyB);
		nsObj.doSearch = function() {
			client.setPaging(1, limit, "relevance","desc");
			client.search($("#beca_search_input").val(), nsObj.displayResults);
		};
		nsObj.hideResults = function() {
			$("#beca_results_container").hide();
		}
		nsObj.enter = function () {
			if($(".active").length) {
				window.location.href = $(".active").find("a").prop("href");
			} else {
				nsObj.doSearch();
			}
		}
		nsObj.moveUp = function () {
			if($("#beca_results_container").is(":hidden")) {
				return;
			} else if($(".beca_grid_container:first-of-type").hasClass("active")) {
				$(".beca_grid_container:first-of-type").removeClass("active");
			} else {
				$(".active").removeClass("active").prev().addClass("active");
				if($(".active").prev().length) {
					$(".active").prev()[0].scrollIntoView();
				}
			}
		}
		nsObj.moveDown = function () {
			if($("#beca_results_container").is(":hidden")) {
				return;
			} else if($(".active").length) {
				$(".beca_grid_container.active").removeClass("active").next().addClass("active").prev()[0].scrollIntoView();
			} else {
				$(".beca_grid_container:first-of-type").addClass("active");
			}
		}
		nsObj.hasMoreResults = function () {
			return total > limit + 1
				? ((currentPage - 1) * limit + 1) < total
				: false
			;
		}
		nsObj.loadResults = async function () {
			if(nsObj.hasMoreResults()) {
				loading = true;
				client.nextPage();
				await client.search($("#beca_search_input").val(), nsObj.appendResults);
				loading = false;
			}
		}	
		nsObj.displayResults = function(res) {
			$("#beca_results_container").show();
			$('#beca_results_list').empty().scrollTop(0);
			nsObj.appendResults(res);
		}		
		nsObj.appendResults = function (res) {
			total = res.total_hits || 0;
			currentPage = res.page || 1;
			$("#beca_number_of_results").empty().append(
				(total > 0)
					? `${(currentPage -1) * limit + 1} - ${currentPage * Math.min(limit, total)} z ${total} výsledků.`
					: `<p>Žádný výsledek nenalezen.</p>`
			);
			if(total > 0) {
				res.hits.forEach(nsObj.buildRow);
				$(".beca_grid_container")
					.on("mouseover", function () {
						if($(".active").length) {
							$(".active").removeClass("active");
						}
						$(this).addClass("active");
					})
					.on("click", function () {
						window.location.href = $(this).find("a").prop("href");
					})
				;													
				$(".beca_results_about").each(function () {
					let wordArray = $(this).html().split(' ');
					while($(this).outerHeight() > $(this).offsetHeight) {
						wordArray.pop();
						$(this).html(wordArray.join(' ') + '...');
			 		}
				});
				$(".beca_loader_wrapper").detach();
				$("#beca_results_list")
					.append(`
						<div class="beca_loader_wrapper">
							${nsObj.hasMoreResults()
								?	`<div class="beca_loader">
										<div></div><div></div><div></div><div></div>
									</div>`
								: 	total > 0 ? '<div id="beca_end_of_list">Konec seznamu</div>' : ''
							}	
						</div>
					`)
					.on("scroll", function() {
						if ($(this).scrollTop() == $(this).prop("scrollHeight") - $(this).height() && nsObj.hasMoreResults() && loading === false) {
							nsObj.loadResults();
						}
					})
				;
			}
		}
		nsObj.buildRow = function(hit) {
			const about = hit.custom_fields.about ? nsObj.regFirstWords(hit.custom_fields.about, about_limit) : '';
			const categories = hit.custom_fields.categories ? nsObj.assignType(hit.custom_fields.categories) : '';		
			const courses = hit.custom_fields.courses ?? '';
			return $("#beca_results_list").append(`
				<div class="beca_grid_container">
					<div class="beca_main_image ${hit.document_type ?? ''} ${(hit.images.main) ? '' : 'noimage'}"
					${hit.images.main
						? `style="background-image: url(data:image/jpeg;base64,${hit.images.main_b64}) no-repeat"`
						: ''
					}>
					${hit.images.main
						? `<img src="${hit.images.main}" alt="${hit.title}">`
						: ''
					}
					</div>
					<div class="beca_results_hit">
						<a href="${hit.url}" data-analytics="${hit.id}">${hit.title}</a>
					</div>
					<div class="beca_results_about">
						${about}
					</div>
					<div class="beca_results_categories">
						${categories}
					</div>
					<div class="beca_results_courses">
						${courses}
					</div>
			`);
		}
		nsObj.appendLoader = function () {
	
		}
	// --- pomocne funkce AKA helpery
		nsObj.regFirstWords = function(s, n) {
			// ?: non-capturing subsequent sp+word.Change {} if you want to require n instead of allowing fewer
			return s.replace(/\s+/g," ").split(/(?=\s)/gi).slice(0, n).join('');
		}
		nsObj.assignType = function(v) {
			switch(typeof v) {
				case 'string':
					return v;
				case 'object':
					return [... v].join(' ');
				case 'undefined':
					return '';	
			}	 	
		}
		nsObj.ready = function ($) {
			$(function() {
				$("#beca_search_input").on('keydown keypress', function(e) {
					if(e.keyCode == '38' || e.keyCode == '40') {
						e.preventDefault();
					}
				});
				$("#beca_search_input").on('keyup', function(e) {
					switch(e.keyCode) {
						case 13: // Enter Key
							nsObj.enter();
							break;
						case 27: //Esc Key
							nsObj.hideResults();
							break;	
						case 38: // Up Arrow Key
							nsObj.moveUp();
							break;
						case 40: // Down Arrow Key
							nsObj.moveDown();
							break;
						default:	
							clearTimeout(typingTimer);
							if ($('#beca_search_input').val().length) {
							typingTimer = setTimeout(nsObj.doSearch, interval);
						}
					}
				});
				$("#beca_searchfield_container").children().on("click", function(e) {
					e.stopPropagation();
				});
				$(document).on("click", nsObj.hideResults);
			});
		}	
	} (window.UIsearch = window.UIsearch || {})
);
UIsearch.ready($);
