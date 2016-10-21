(function($, window, document, undefined) {
				var defaults = {
					color: "blue",
					radius: 200

				}
				var YunPlugin = function(elements, options) {
					this.$elements = elements;
					this.settings = $.extend(true, defaults, options || {})
				}
				YunPlugin.prototype = {
					init: function() {
						var that = this;
						return that.$elements.each(function() {
							that.getStart($(this));
						})
					},
					getStart: function(elem) {
						var that = this
						that.main(elem);
						//that.update(elem);
					},
					main: function(elem) {
						var that = this
						 radius = that.settings.radius;
						 dtr = Math.PI / 180;
						 if(radius>200){
						 	d = 3*radius/2;
						 }else{
						 	d=300
						 }
						 mcList = [];
						 active = false;
						 lasta = 1;
						 lastb = 1;
						 distr = true;
						 tspeed = 10;
						 size = 250;
						 mouseX = 0;
						 mouseY = 0;
						 howElliptical = 1;
						 
						var id = elem[0].id;
						oDiv = document.getElementById(id);
						oDiv.style.position = "relative"
						aA=oDiv.getElementsByTagName('a');
						for(i = 0; i < aA.length; i++) {
							aA[i].style.position ="absolute"
							oTag = {};
							oTag.offsetWidth = aA[i].offsetWidth;
							oTag.offsetHeight = aA[i].offsetHeight;
							mcList.push(oTag);
						}
						that.sineCosine(0, 0, 0,dtr);
						that.positionAll();
						 
						oDiv.onmouseover = function() {
							active = true;
						};

						oDiv.onmouseout = function() {
							active = false;
						};
						oDiv.onmousemove = function(ev) {
							var oEvent = window.event || ev;
							mouseX = oEvent.clientX - (oDiv.offsetLeft + oDiv.offsetWidth / 2);
							mouseY = oEvent.clientY - (oDiv.offsetTop + oDiv.offsetHeight / 2);
							mouseX /= 5;
							mouseY /= 5;
						};
						//var update = that.update;
						setInterval(function(){
							that.update(that)
						}, 30);

					},
					positionAll: function() {
						var phi = 0;
						var theta = 0;
						var max = mcList.length;
						var i = 0;

						var aTmp = [];
						var oFragment = document.createDocumentFragment();

						//�������
						for(i = 0; i < aA.length; i++) {
							aTmp.push(aA[i]);
						}

						aTmp.sort(
							function() {
								return Math.random() < 0.5 ? 1 : -1;
							}
						);

						for(i = 0; i < aTmp.length; i++) {
							oFragment.appendChild(aTmp[i]);
						}

						oDiv.appendChild(oFragment);

						for(var i = 1; i < max + 1; i++) {
							if(distr) {
								phi = Math.acos(-1 + (2 * i - 1) / max);
								theta = Math.sqrt(max * Math.PI) * phi;
							} else {
								phi = Math.random() * (Math.PI);
								theta = Math.random() * (2 * Math.PI);
							}
							mcList[i - 1].cx = radius * Math.cos(theta) * Math.sin(phi);
							mcList[i - 1].cy = radius * Math.sin(theta) * Math.sin(phi);
							mcList[i - 1].cz = radius * Math.cos(phi);

							aA[i - 1].style.left = mcList[i - 1].cx + oDiv.offsetWidth / 2 - mcList[i - 1].offsetWidth / 2 + 'px';
							aA[i - 1].style.top = mcList[i - 1].cy + oDiv.offsetHeight / 2 - mcList[i - 1].offsetHeight / 2 + 'px';
						}
					},
					doPosition: function() {
						var l = oDiv.offsetWidth / 2;
						var t = oDiv.offsetHeight / 2;
						for(var i = 0; i < mcList.length; i++) {
							aA[i].style.left = mcList[i].cx + l - mcList[i].offsetWidth / 2 + 'px';
							aA[i].style.top = mcList[i].cy + t - mcList[i].offsetHeight / 2 + 'px';

							aA[i].style.fontSize = Math.ceil(12 * mcList[i].scale / 2) + 8 + 'px';

							aA[i].style.filter = "alpha(opacity=" + 100 * mcList[i].alpha + ")";
							aA[i].style.opacity = mcList[i].alpha;
						}

					},
					sineCosine: function(a,b,c,dtr) {
						sa = Math.sin(a * dtr);
						ca = Math.cos(a * dtr);
						sb = Math.sin(b * dtr);
						cb = Math.cos(b * dtr);
						sc = Math.sin(c * dtr);
						cc = Math.cos(c * dtr);
					},
					update: function($this) {
						console.log("123")
						var that = $this;
						var a;
						var b;
						if(active) {
							a = (-Math.min(Math.max(-mouseY, -size), size) / radius) * tspeed;
							b = (Math.min(Math.max(-mouseX, -size), size) / radius) * tspeed;
						} else {
							a = lasta * 0.98;
							b = lastb * 0.98;
						}

						lasta = a;
						lastb = b;

						if(Math.abs(a) <= 0.01 && Math.abs(b) <= 0.01) {
							return;
						}

						var c = 0;
						that.sineCosine(a, b, c,dtr);
						for(var j = 0; j < mcList.length; j++) {
							var rx1 = mcList[j].cx;
							var ry1 = mcList[j].cy * ca + mcList[j].cz * (-sa);
							var rz1 = mcList[j].cy * sa + mcList[j].cz * ca;

							var rx2 = rx1 * cb + rz1 * sb;
							var ry2 = ry1;
							var rz2 = rx1 * (-sb) + rz1 * cb;

							var rx3 = rx2 * cc + ry2 * (-sc);
							var ry3 = rx2 * sc + ry2 * cc;
							var rz3 = rz2;

							mcList[j].cx = rx3;
							mcList[j].cy = ry3;
							mcList[j].cz = rz3;

							per = d / (d + rz3);

							mcList[j].x = (howElliptical * rx3 * per) - (howElliptical * 2);
							mcList[j].y = ry3 * per;
							mcList[j].scale = per;
							mcList[j].alpha = per;

							mcList[j].alpha = (mcList[j].alpha - 0.6) * (10 / 6);
						}

						that.doPosition();
						that.depthSort();
					},
					depthSort: function() {
						var i = 0;
						var aTmp = [];

						for(i = 0; i < aA.length; i++) {
							aTmp.push(aA[i]);
						}

						aTmp.sort(
							function(vItem1, vItem2) {
								if(vItem1.cz > vItem2.cz) {
									return -1;
								} else if(vItem1.cz < vItem2.cz) {
									return 1;
								} else {
									return 0;
								}
							}
						);

						for(i = 0; i < aTmp.length; i++) {
							aTmp[i].style.zIndex = i;
						}
					}
				}

				$.fn.extend({
					yunPlugin: function(options) {
						new YunPlugin(this, options).init();
					}
				})
			})(jQuery, window, document)