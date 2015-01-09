function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function setCookieResponse(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
    return true;
}
function eraseCookie(name) {
    setCookie(name,"",-1);
}
opcionesIdentificadores = [
    {value:'NO. SERIE', label:'NO. SERIE'},
    {value:'IMEI', label:'IMEI'},
    {value:'VIN', label:'VIN (autos)'},
    {value:'NO. PLACAS', label:'NO. PLACAS'},
    {value:'OTRO', label:'OTRO'}
];
function initializeMapa(x,y,reporte) {
  document.getElementById("map_canvasContaniner").innerHTML = "";
  var child = document.createElement ("div");
  child.style.width = "100%";
  child.style.height = "300px";
  child.id = "map_canvas";
  document.getElementById("map_canvasContaniner").appendChild(child);
  var pos;      
  var marcador = new google.maps.Marker({
      title: 'Lugar del suceso',
      icon: '/img/marker.png',
      draggable:true,
      animation: google.maps.Animation.DROP
  });

  var markers = [];
        
  var styles = [
    {
        "stylers": [
            {
                "hue": "#2c3e50"
            },
            {
                "saturation": 150
            },
            {
                "lightness": 50
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 50
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }
  ]

  if(x){
    pos = new google.maps.LatLng(x,y);
  } else{
    pos = new google.maps.LatLng(19.432602,-99.133205);
    if(navigator.geolocation) {
      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        map.setCenter(initialLocation);
      }, function() {
        handleNoGeolocation(browserSupportFlag);
      });
    }
    else {
      browserSupportFlag = false;
      handleNoGeolocation(browserSupportFlag);
    }
  }

  if (reporte == true) {
    console.log("hola que pasa?");
    marcador.draggable = false;
    var styles = [
      {
          "featureType": "landscape",
          "stylers": [
              {
                  "saturation": -100
              },
              {
                  "lightness": 65
              },
              {
                  "visibility": "on"
              }
          ]
      },
      {
          "featureType": "poi",
          "stylers": [
              {
                  "saturation": -100
              },
              {
                  "lightness": 51
              },
              {
                  "visibility": "simplified"
              }
          ]
      },
      {
          "featureType": "road.highway",
          "stylers": [
              {
                  "saturation": -100
              },
              {
                  "visibility": "simplified"
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "stylers": [
              {
                  "saturation": -100
              },
              {
                  "lightness": 30
              },
              {
                  "visibility": "on"
              }
          ]
      },
      {
          "featureType": "road.local",
          "stylers": [
              {
                  "saturation": -100
              },
              {
                  "lightness": 40
              },
              {
                  "visibility": "on"
              }
          ]
      },
      {
          "featureType": "transit",
          "stylers": [
              {
                  "saturation": -100
              },
              {
                  "visibility": "simplified"
              }
          ]
      },
      {
          "featureType": "administrative.province",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "water",
          "elementType": "labels",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "lightness": -25
              },
              {
                  "saturation": -100
              }
          ]
      },
      {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
              {
                  "hue": "#ffff00"
              },
              {
                  "lightness": -25
              },
              {
                  "saturation": -97
              }
          ]
      }
    ]
  };

  var mapOptions = {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles:styles,
      center: pos,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: false
  };

  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

  if (x) {
    marcador.setPosition(pos);
    marcador.setMap(map);
    latitud = x;
    longitud = y;
    console.log("la latitud es" +  x);
  } else{
    latitud = null;
    longitud = null;
  };

  if (reporte == true) {
    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(pos);
    });
  } else {
    google.maps.event.addListener(map,'click',function(event){
          marcador.setPosition(event.latLng);
          marcador.setMap(map);
          latitud = event.latLng.lat();
          longitud = event.latLng.lng();
    });
    google.maps.event.addListener(marcador, 'dragend', function(event) 
    {
        latitud = event.latLng.lat();
        longitud = event.latLng.lng();
    });


    var input = (document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var searchBox = new google.maps.places.SearchBox((input));

    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }
      for (var i = 0, marker; marker = markers[i]; i++) {
        marker.setMap(null);
      }

      // For each place, get the icon, place name, and location.
      markers = [];
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0, place; place = places[i]; i++) {
        var image = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        var marker = new google.maps.Marker({
          map: map,
          //icon: image,
          icon: '/img/marker.png',
          title: place.name,
          position: place.geometry.location
        });

        markers.push(marker);

        bounds.extend(place.geometry.location);
      }

      map.fitBounds(bounds);
    });
    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = map.getBounds();
      searchBox.setBounds(bounds);
    });
  }
  //google.maps.event.trigger(map, "resize");
}
var app = angular.module('findMyObjectApp', ['ngResource', 'ngRoute', 'ngCookies', 'angularFileUpload', 'ui.bootstrap']);

    app.config(function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                controller: "LoginUser"
            }).
            when('/dashboard', {
                controller: "Dashboard",
                templateUrl: "templates/dashboard.html"
            }).
            when('/', {
                controller: "Dashboard",
                templateUrl: "templates/dashboard.html"
            }).
            when('/articulos/reportados', {
                controller: "Reportados",
                templateUrl: "templates/articulosReportados.html"
            }).
            when('/articulos/encontrados', {
                controller: "Encontrados",
                templateUrl: "templates/articulosEncontrados.html"
            }).
            when('/reporte/robo', {
                controller: "editarReporte",
                templateUrl: "templates/editarReporte.html"
            }).
            when('/reporte/hallazgo', {
                controller: "editarReporte",
                templateUrl: "templates/editarReporte.html",
            }).
            when('/editar/robo/:idReporte', {
                controller: "editarReporte",
                templateUrl: "templates/editarReporte.html",
            }).
            when('/editar/hallazgo/:idReporte', {
                controller: "editarReporte",
                templateUrl: "templates/editarReporte.html",
            }).
            when('/editar/articulo/:idArticulo', {
                controller: "editArticulo",
                templateUrl: "templates/editarArticulo.html",
            }).
            when('/reporte/:idReporte', {
                controller: "DetallesReporte",
                templateUrl: "templates/reporteDetalles.html",
            }).
            when('/robosreportados', {
                controller: "Robosreportados",
                templateUrl: "templates/sucesosreportados.html",
            }).
            when('/hallazgosreportados', {
                controller: "Hallazgosreportados",
                templateUrl: "templates/sucesosreportados.html",
            }).
            when('/articulo/:idArticulo', {
                controller: "DetallesArticulo",
                templateUrl: "templates/reporteArticulo.html",
            }).
            when('/preferencias',{
                controller: "Preferencias",
                templateUrl: "templates/preferencias.html",
            }).
            when('/mensajes', {
                templateUrl: "templates/mensajes.html",
                controller: "Mensajes",
            }).
            when('/mensajes/:destinatarioId', {
                templateUrl: "templates/mensajes.html",
                controller: "Mensajes",
            }).
            when('/mensajes/enviar/:destinatario', {
                controller: "Mensajes",
                templateUrl: "templates/enviarMensajes.html"
            }).
            when('/terminos', {
                controller: "Informacion",
                templateUrl: "templates/terminos.html"
            }).
            when('/quienessomos', {
                controller: "Informacion",
                templateUrl: "templates/quienessomos.html"
            }).
            when('/contacto', {
                controller: "Contacto",
                templateUrl: "templates/contacto.html"
            }).
            when('/aviso', {
                controller: "Informacion",
                templateUrl: "templates/aviso.html"
            }).
            otherwise({ templateUrl: 
                "templates/error404.html",
            });
    });
    app.directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }]);
angular.module('findMyObjectApp').service('modalService', ['$modal',
    function ($modal) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: '/templates/imagenes.html'
        };

        var modalOptions = {
            headerText: 'Imagen',
            imagenUrl : 'none',
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.close = function (result) {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.modalOptions.verCompleto = function (url) {
                        window.open(url);
                    };
                }
            }

            return $modal.open(tempModalDefaults).result;
        };

    }]);
app.factory('servicesConsumer', ['$resource', function($resource) {
        return {
            //validar si el nombre de usuario está disponible
            validar: $resource('/rest/api/login/existeUsuario/',{}, { 
                username:
                    {
                        method: 'GET', 
                        params: { 
                            username: '@username',
                        }, 
                        isArray: false 
                    }
            }),
            //Preferencias - Recuperar datos de usuario
            obtener: $resource('/rest/api/login/info/',{}, { 
                infoUsuario:
                    {
                        method: 'GET', 
                        params: { 
                            id_usuario: '@id_usuario'
                        }, 
                        isArray: false 
                    }
            }),
            //Preferencias - Modificar datos de usuario
            modificar: $resource('/rest/api/Login/',{}, { 
                infoUsuario:
                    {
                        method: 'PUT', 
                        params: { 
                            id: '@id',
                            email: '@email',
                            Password: '@Password',
                            nombre: '@nombre',
                            paterno: '@paterno',
                            materno: '@materno',
                            username: '@username'
                        }, 
                        isArray: false 
                    }
            }),
            //registro y consulta de usuarios
            usuario: $resource('/rest/api/login/',{}, { 
                registrar:
                    {
                        method: 'POST', 
                        params: { 
                            username: '@username',
                            email: '@email',
                            nombre: '@nombre',
                            paterno: '@paterno',
                            materno: '@materno',
                            Password:'@Password'
                        }, 
                        isArray: false 
                    },
                loguear:
                    {
                        method: 'GET', 
                        params: { 
                            usuario: '@usuario',
                            pass: '@pass'
                        }, 
                        isArray: false 
                    },
                modificar:
                    {
                        method: 'PUT', 
                        params: { 
                            id: '@id',
                            email: '@email',
                            Password: '@Password',
                            nombre: '@nombre',
                            paterno: '@paterno',
                            materno: '@materno',
                            username: '@username'
                        }, 
                        isArray: false 
                    },
                borrar:
                    {
                        method: 'DELETE', 
                        params: { 
                            id: '@usuario'
                        }, 
                        isArray: true 
                    },
            }),
            //conseguir CP
            procesar: $resource('/rest/api/CP',{}, { 
                CP:
                    {
                        method: 'GET', 
                        params: { 
                            cp: '@cp'
                        }, 
                        isArray: false 
                    }
            }),
            //Reportar siniestro
            reportar: $resource('/rest/api/reporte/siniestro/',{}, { 
                siniestro:
                    {
                        method: 'POST', 
                        params: { 
                            id_usuario: '@id_usuario',
                            fecha_reporte: '@fecha_reporte',
                            id_cp: '@id_cp',
                            delegacion: '@delegacion',
                            estado: '@estado',
                            descripcion: '@descripcion',
                            fecha_creacion: '@fecha_creacion'
                        }, 
                        isArray: false 
                    }
            }),
            //Reportar hallazgo
            hallazgo: $resource('/rest/api/reporte/hallazgo',{}, { 
                reportar:
                    {
                        method: 'POST', 
                        params: { 
                            id_usuario: '@id_usuario',
                            fecha_reporte: '@fecha_reporte',
                            id_cp: '@id_cp',
                            delegacion: '@delegacion',
                            estado: '@estado',
                            descripcion: '@descripcion',
                            fecha_creacion: '@fecha_creacion'
                        }, 
                        isArray: false 
                    }
            }),
            //Agregar articulo
            articulo: $resource('/rest/api/articulo/siniestro/',{}, { 
                registrar:
                    [{
                        method: 'POST', 
                        params: { 
                            id_reporte:         '@id_reporte',
                            id_usuario:         '@id_usuario',
                            id_cat_articulo:    '@id_cat_articulo',
                            modelo:             '@modelo',
                            marca:              '@marca',
                            descripcion:        '@descripcion',
                            identificadores: [
                                {
                                    descripcion:        "identificador no respuesta",
                                    identificador:      "identificador no respuesta"
                                }
                            ]
                        }, 
                        isArray: true 
                    }]
            }),
            articulos: $resource('/rest/api/CatArticulo/',{}, { 
                clasificacion:
                    {
                        method: 'GET',
                        isArray: true 
                    }
            }),
            ultimos: $resource('/rest/api/articulo/ultimosArticulosSiniestro',{}, {
                obtener:
                    {
                        method:'GET',
                        isArray: false
                    }
            }),
            hallazgos: $resource('/rest/api/articulo/articulosHalladosXUsuario',{}, {
                obtener:
                    {
                        method:'GET',
                        params:{
                            id_usuario: '@id_usuario'
                        },
                        isArray: false
                    }
            }),
            siniestros: $resource('/rest/api/articulo/articulosSiniestroXUsuario',{}, {
                obtener:
                    {
                        method:'GET',
                        params:{
                            id_usuario: '@id_usuario'
                        },
                        isArray: false
                    }
            }),
            encontrados: $resource('/rest/api/articulo/articulosEncontradosXUsuario',{}, {
                obtener:
                    {
                        method:'GET',
                        params:{
                            id_usuario: '@id_usuario'
                        },
                        isArray: false
                    }
            }),
            obtenerSiniestros: $resource('/rest/api/reporte/siniestrosXUsuario/',{}, {
                porUsuario:
                    {
                        method:'GET',
                        params:{
                            id_usuario: '@id_usuario'
                        },
                        isArray: false
                    }
            }),
            obtenerHallazgos: $resource('/rest/api/reporte/hallazgosXUsuario/',{}, {
                porUsuario:
                    {
                        method:'GET',
                        params:{
                            id_usuario: '@id_usuario'
                        },
                        isArray: false
                    }
            }),
            obtenerReporte: $resource('/rest/api/reporte/:idReporte',{}, {
                porId:
                    {
                        method:'GET',
                        params:{
                            idReporte: '@idReporte'
                        },
                        isArray: false
                    }
            }),
            modificarEvento: $resource('/rest/api/Reporte/',{}, {
                reporte:
                    {
                        method: 'PUT', 
                        params: { 
                            id:             '@id',
                            id_usuario:     '@id_usuario',
                            fecha_reporte:  '@fecha_reporte',
                            id_cp:          '@id_cp',
                            delegacion:     '@delegacion',
                            estado:         '@estado',
                            descripcion:    '@descripcion',
                            fecha_creacion: '@fecha_creacion',
                            id_cat_reporte: '1',
                            id_cat_estatus_reporte: '1'
                        }, 
                        isArray: true 
                    }
            }),
            obtenerArticulo: $resource('/rest/api/articulo/:idReporte',{}, {
                porId:
                    {
                        method:'GET',
                        params:{
                            idReporte: '@idReporte'
                        },
                        isArray: false
                    }
            }),
            recuperar: $resource('/rest/api/login/olvidoPassword/',{}, {
                password:
                    {
                        method:'POST',
                        params:{
                            email: '@email'
                        },
                        isArray: false
                    }
            }),
            ConversacionesXUsuario: $resource('/rest/api/mensaje/ConversacionesXUsuario/',{}, {
                get:
                    {
                        method:'POST',
                        params:{
                            id_usuario: '@id_usuario'
                        },
                        isArray: false
                    }
            }),
            conversacion: $resource('/rest/api/mensaje/Conversacion/',{}, {
                get:
                    {
                        method:'POST',
                        params:{
                            id_usuario:         '@id_usuario',
                            id_destinatario:    '@id_destinatario'
                        },
                        isArray: false
                    }
            }),
            enviardm: $resource('/rest/api/mensaje/enviardm/',{}, {
                send:
                    {
                        method:'POST',
                        params:{
                            id_usuario_remitente:       '@id_usuario_remitente',
                            id_usuario_destinatario:    '@id_usuario_destinatario',
                            mensaje:                    '@mensaje'
                        },
                        isArray: false
                    }
            }),
            conseguirLlaves: $resource('/rest/api/LlaveIdentificador/',{}, {
                send:
                    {
                        method:'POST',
                        params:{
                            id_parent:       '@id_parent'
                        },
                        isArray: false
                    }
            }),
            buscar: $resource('/rest/api/articulo/busquedaArticulos/',{}, {
                articulos:
                    {
                        method:'POST',
                        params:{
                            parametro:       '@parametro'
                        },
                        isArray: false
                    }
            }),
            optenerNotificaciones: $resource('/rest/api/notificaciones/NotificacionesXUsuario/',{}, {
                porUsuario:
                    {
                        method:'POST',
                        params:{
                            id_usuario:       '@id_usuario'
                        },
                        isArray: false
                    }
            }),
            editarNotificaciones: $resource('/rest/api/notificaciones/CambiarEstatusNotificacion/',{}, {
                porId:
                    {
                        method:'POST',
                        params:{
                            id_notificacion:       '@id_notificacion'
                        },
                        isArray: false
                    }
            }),
            mail: $resource('/rest/api/Contacto/',{}, {
                enviar:
                    {
                        method:'POST',
                        params:{
                            nombreRemitente:        '@nombreRemitente',
                            emailremitente:         '@emailremitente',
                            asunto:                 '@asunto',   
                            mensaje:                '@mensaje'      
                        },
                        isArray: false
                    }
            })

        };
    }]);
