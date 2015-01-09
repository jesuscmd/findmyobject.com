app.controller('mainController', function ($scope, $routeParams, $location, $cookies, servicesConsumer, Data, $interval) {
    var userIdTemp; 
    if ($cookies.logged == "true"){
        userIdTemp = $cookies.idUsuario;
    } else{
        if (Data.getidUsuario() != ""){
            userIdTemp = Data.getidUsuario();
        } else {
            //$location.path('inicio.html');
            window.location ="inicio.html";
        }
    }
    $scope.currentUser = $cookies.idUsuario;

    data = {
            id_usuario: $cookies.idUsuario
    };
    servicesConsumer.obtener.infoUsuario({id_usuario: $cookies.idUsuario}, function(res){
        $scope.usuarioDatos = res.response;
    });

    servicesConsumer.siniestros.obtener({id_usuario:userIdTemp}, function(response){
        articulos =response.response;
        contador = 0;
        $scope.articulos = [];
        for (val in articulos){
            if(articulos[val].FMO_COINCIDENCIAS.length>0 && articulos[val].id_usuario == userIdTemp){
                contador++;
            };
            val1 = Number(val) + 1;
            articulos[val].idElemento = val;
            if(val1 % 4 == 0 && val1 > 1){
                articulos[val].newRow = true;
            }
            if(val1 % 2 == 0 && val1 > 1){
                articulos[val].newRowMobile = true;
            }
            $scope.articulos.push(articulos[val]);
        }
        $scope.contador = contador;
    }, function(){
        console.log("error");
    });
    servicesConsumer.hallazgos.obtener({id_usuario:userIdTemp}, function(response){
        articulos =response.response;
        $scope.articulos2 = [];
        for (val in articulos){
            val1 = Number(val) + 1;
            articulos[val].idElemento = val;
            if(val1 % 4 == 0 && val1 > 1){
                articulos[val].newRow = true;
            }
            if(val1 % 2 == 0 && val1 > 1){
                articulos[val].newRowMobile = true;
            }
            $scope.articulos2.push(articulos[val]);
        }
        //$scope.loadedHallados = true;              
    }, function(){
        console.log("error");
    });

//});



//app.controller('menuUsuario', function ($scope, $cookies, $location, Data, servicesConsumer, $interval, $routeParams) {
    // if ($cookies.user != undefined){
    //     $scope.usuario = $cookies.user;
    // } else{
    //     $scope.usuario = Data.getNombreUsuario();
    // }

    //console.log($routeParams.destinatarioId);
    $scope.cerrarSesion = function() {
        Data.setEstadoLogueado(true);
        eraseCookie("logged");
        eraseCookie("user");
        eraseCookie("idUsuario");
        //$location.path('inicio.html');
         window.location = "/inicio.html";
    }
    $scope.cambiarMensajeStatus = function(mensaje){
        if ($routeParams.destinatarioId != undefined) {
            if($routeParams.destinatarioId == mensaje.id_usuario){
                $scope.mensajes.splice(mensaje.index,1);
            }
        };
        servicesConsumer.editarNotificaciones.porId({id_notificacion:mensaje.id});
        $location.path('/mensajes/' + mensaje.id_usuario);        
    };
    $scope.cambiarCoincidenciaEstatus = function(coincidencia){
        valores = coincidencia.valores.split("|");

        if ($routeParams.idArticulo != undefined) {
            if($routeParams.idArticulo == valores[1]){
                $scope.coincidencias.splice(coincidencia.index,1);
            }
        };
        servicesConsumer.editarNotificaciones.porId({id_notificacion:coincidencia.id});        
        $location.path('/articulo/' + valores[1]);
    };

    $scope.mensajes = [];
    $scope.coincidencias = [];
    servicesConsumer.optenerNotificaciones.porUsuario({id_usuario:$cookies.idUsuario}, function(res) {
        console.log(res);
        res.response.forEach(function(notificacion, index) {
            console.log(index);
            notificacion.index = index;
            if(notificacion.valores == "Default"){
                $scope.mensajes.push(notificacion);
            } else if (notificacion.valores != undefined) {
                $scope.coincidencias.push(notificacion);
            }
        });
        console.log($scope.mensajes);
    });
    $interval( function(){
        servicesConsumer.optenerNotificaciones.porUsuario({id_usuario:$cookies.idUsuario}, function(res) {
            $scope.mensajes = [];
            $scope.coincidencias = [];
            res.response.forEach(function(notificacion, index) {
                notificacion.index = index;
                if(notificacion.valores == "Default"){
                        $scope.mensajes.push(notificacion);
                } else if (notificacion.valores != undefined) {
                        $scope.coincidencias.push(notificacion);
                }
            });
        });
    }, 6000);
});
app.controller('LoginUser', function ($scope, $location, servicesConsumer, $cookies,Data) {
    
    if($cookies.logged == "true" && Data.getEstadoLogueado() == false){
            window.location ="index.html#/dashboard";
        } else {
        $scope.loguearUsuario = function() {
            $scope.validandoLoguin = false;
            $scope.datosError = false;
            $scope.validandoLoguin = true;
            datosUsuario = {
                usuario:    $scope.email,
                pass:       $scope.passw
            }
            servicesConsumer.usuario.loguear({}, datosUsuario, function(res) {
                console.log(res);
                if (res.msg == "Login correcto, Id de usuario:"){
                    setCookie("idUsuario", res.response, 30);
                    setCookie("user", $scope.email, 30);
                    setCookie("logged", true, 30);
                    Data.setidUsuario(res.response);
                    Data.setNombreUsuario($scope.email);
                    Data.setEstadoLogueado(false);

                    //$location.path('dashboard');
                    //console.log("hola ya pitufo");
                    window.location ="index.html#/dashboard";
                } else {
                    $scope.datosError = true;
                    $scope.validandoLoguin = false;
                }

            });
        };
        $scope.FailRegisterMessage = false;
        $scope.validando = false;
        $scope.recuperarContrasena = false;
        $scope.contrasenaEnviada = false;
        $scope.submit = function() {
            $scope.validando = true;  
            servicesConsumer.validar.username({"username": $scope.userName}, function(res) {
                if (res.msg != "El usuario ya existe"){
                    data = {
                            email:      $scope.newEmail,
                            nombre:     $scope.newNombre,
                            paterno:    $scope.newPaterno,
                            materno:    $scope.newMaterno,
                            username:   $scope.userName,
                            Password:   $scope.newPass
                    };
                    servicesConsumer.usuario.registrar({}, data, function(res) {
                        //si ya ha sido usado ese mail
                        if (res.msg == "El usuario ya existe"){
                            $scope.respuesta = "El e-mail ya ha sido usado, por favor ingrese uno diferente";
                            $scope.FailRegisterMessage = true;
                            $scope.validando = false;  
                        } else if(res.msg == "Usuario creado con id:"){
                            setCookie("user", $scope.email, 30);
                            setCookie("logged", true, 30);
                            setCookie("idUsuario", res.response, 30);
                            Data.setNombreUsuario($scope.newEmail);
                            Data.setidUsuario(res.response);
                            Data.setEstadoLogueado(false);
                            //$location.path('dashboard');
                            window.location ="index.html#/dashboard";
                        }
                    }, function(){
                        console.log("no existe");
                    });
                //de lo contrario lanza un mensaje de error
                } else {
                        $scope.respuesta = res.msg;
                        $scope.FailRegisterMessage = true;
                }
            }, function(error) {
              // Error handler code
                $scope.$apply(function() {
                    $scope.respuesta = "Ocurrió un error, inténtelo más tarde";
                    $scope.FailRegisterMessage = true;
                })
            }); 
        };
        $scope.open = function(){
            $('a[href="#recuperar"]').tab('show')
        }
        $scope.recuperarContrasenaHecho = function(){
            $scope.recuperarContrasena = false;
        }
        $scope.user = {
            email:""
        };
        $scope.recuperarFunction = function(){
            $scope.errorMail = false;
            $scope.procesandoIdentificador = true;
            console.log($scope.user.email);
            data = {
                email:$scope.user.email
            }
            servicesConsumer.recuperar.password({}, data, function(res) { 
                if (res.msg == "Password enviado "){
                    $scope.contrasenaEnviada = true;
                    $scope.procesando = false;
                }
            }, function(){
                $scope.procesando = false;
                $scope.errorMail = true;
            });
        }
    };
});
app.controller('recuperarContrasena', function ($scope, servicesConsumer, $http, $location, $cookies, $modal) {
    $scope.recuperarFunction = function(){
        data = {
            email:$scope.emailRecuperar
        }
        console.log();
        console.log($scope.emailRecuperar);
        console.log($scope.recuperarContrasena);

        servicesConsumer.recuperar.password({}, data, function(res) { 
            console.log(res);
            if (res.msg == "Password enviado "){
                $scope.contrasenaEnviada = true;
            }
        }, function(){
            console.log("error");
        });
    };
});
app.directive('validarCodigoPostal', function (servicesConsumer) {
    return {
        restrict: 'EA',
        template:   '<div class="form-group col-md-12">'+
                        '<label>C.P.</label>'+
                        '<input id="codigoPostal" name="inputName" ng-value="inputName" ng-model="inputValue" class="form-control" max="5" ng-disabled="isDisabled" />'+
                    '</div>'+
                    '<div class="form-group col-md-12 has-warning" ng-show="cpNoEncontrado">'+
                        '<label ng-show="cpNoEncontrado" class="control-label">CÓDIGO POSTAL NO ENCONTRADO EN LA BASE DE DATOS</label>'+
                    '</div>',
        scope: {
            inputValue: '=',
            inputName: '=',
            inputEdicion: '='
        },
        link: function (scope) {

            scope.childFunction = function (){
                scope.called = true;
              };
            scope.$watch('inputValue', function(newValue,oldValue) {
                if(newValue){                    
                    var arr = String(newValue).split("");
                    if (arr.length === 0) return;
                    if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return;
                    if (arr.length === 2 && newValue === '-.') return;
                    if (isNaN(newValue)) {
                        scope.inputValue = oldValue;
                    }
                    if (arr.length === 6){
                        scope.inputValue = oldValue;
                    };
                    if (arr.length >= 5){
                        scope.isDisabled = true;
                        scope.cpNoEncontrado = false;
                        scope.$parent.municipioDisponible = false;
                        scope.$parent.estadoDisponible = false;
                        postData = { 
                          cp: newValue
                        }
                        servicesConsumer.procesar.CP({}, postData, 
                            function(res) {
                                //al encontrar el código postal
                                infoCP = res.response[0];
                                scope.$parent.idCP= infoCP.id;
                                scope.$parent.municipio= infoCP.municipio;
                                scope.$parent.estado= infoCP.estado;
                                if (scope.$parent.modoEdicion == true){
                                    scope.$parent.municipioDisponible = true;
                                    scope.$parent.estadoDisponible = true;
                                }
                                
                                scope.isDisabled = false;
                            }, function(response) {
                                //404 o no encontrado
                                if(response.status === 404) {
                                    scope.$parent.idCP=6;
                                    scope.cpNoEncontrado = true;
                                    scope.$parent.modoEdicion = false;
                                    //scope.inputValue = "";
                                    scope.isDisabled = false;
                                }
                            }
                        );
                    }
                }
            });
        }
    };
});
app.controller('campoRepeat', function ($scope) {
    
    cIndx = $scope.fooKey;
    //VARIABLES PARA MOSTRAR Y ESCONDER FORMAS
    $scope.otrosActivo = false;
    $scope.validaciones = {val1:false, val2 : true, val3 : false}

    //variables en validación
    $scope.validacion2 = true;
    $scope.validacion3 = true;

    if($scope.foo.obligatorio == true){
        $scope.customOpciones = $scope.$parent.arrayObligatorios;
        $scope.opcionesIdentificadoresModel = $scope.customOpciones[cIndx];
        val = $scope.opcionesIdentificadoresModel; 
    } else{
        $scope.customOpciones = opcionesIdentificadores.slice(0);
        if ($scope.foo.edicion != true) {
            $scope.$parent.fooCollection.forEach(function(identificador){
                for(val in $scope.customOpciones){
                    identificadorString = String(identificador.descripcion).toUpperCase();
                    if ($scope.customOpciones[val].value == identificadorString){
                        if ($scope.customOpciones[val].value != "OTRO"){
                            $scope.customOpciones.splice(val, 1);
                        };
                    }
                }
            });
        } else{
            $scope.foo.obligatorio = true;
        }       
    }
    if ($scope.foo.descripcion) {
        switch ($scope.foo.descripcion) {
            case "NO. SERIE":
                $scope.opcionesIdentificadoresModel = $scope.customOpciones[0];
                break;
            case "IMEI":
                $scope.opcionesIdentificadoresModel = $scope.customOpciones[1];
                break;
            case "VIN":
                $scope.opcionesIdentificadoresModel = $scope.customOpciones[2];
                break;
            case "PLACAS || NO. PLACAS":
                $scope.opcionesIdentificadoresModel = $scope.customOpciones[3];
                break;
            default:
                $scope.opcionesIdentificadoresModel = $scope.customOpciones[4];
                $scope.valorOtroLabel = $scope.foo.descripcion;
                break;
        }
    };
    $scope.validarGrupo = function (index, valor){
        //llenamos los tres arrays
        $scope.validaciones[index] = valor;
        if ($scope.validaciones.val1 == true && $scope.validaciones.val2 == true && $scope.validaciones.val3 == true){
            //Si los tres elementos son validos guardemos
            if ($scope.otrosActivo == true) {
                $scope.foo.descripcion = $scope.valorOtroLabel;
            } else {
                $scope.foo.descripcion = $scope.opcionesIdentificadoresModel.value;
            };
            $scope.foo.valido = true;
            } else {
            $scope.foo.valido = false;
        }
        $scope.$parent.verValidezIdentificadores();
    };
    $scope.$watch('opcionesIdentificadoresModel', function(newValue,oldValue) {
        if (newValue){
            if(newValue.value == "OTRO"){
                $scope.otrosActivo = true;
                $scope.validacion2 = false;
                $scope.validarGrupo("val2",false);

            } else {
                $scope.otrosActivo = false;
                $scope.validarGrupo("val2",true);
            }
            $scope.validarGrupo("val1",true);
        } else {
            $scope.validarGrupo("val1",false);
        }
    });
    //vigilemos a OTRO en caso de estar activo
    $scope.$watch('valorOtroLabel', function(newValue,oldValue) {
        if($scope.otrosActivo == true){
            var arr = String(newValue).split("");
            if(oldValue && arr.length > 4){
                $scope.validarGrupo("val2",true);
                $scope.validacion2 = true;
            };
            if ( arr.length < 3 ){
                $scope.validarGrupo("val2",false);
                $scope.validacion2 = false;
            };
        } else{
            $scope.validarGrupo("val2",true);
        }
    });
    //vigilemos al valor del identificador
    $scope.$watch('foo.identificador', function(newValue,oldValue) {
        var arr = String(newValue).split("");
        if(oldValue && arr.length > 4){
            $scope.validarGrupo("val3",true);
            $scope.validacion3 = true;
        };
        if ( arr.length < 5 ){
            $scope.validarGrupo("val3",false);
            $scope.validacion3 = false;
        }
    });
});
app.controller('Datepicker', function ($scope) {
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();
    $scope.maxDate = new Date();//de hoy hacia atras
    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.initDate = new Date();
    $scope.format = 'dd/MM/yyyy';
    //ENVIAMOS AL PADRE EL VALOR
    $scope.$watch('dt', function(newValue,oldValue) {
        if(newValue){
            $scope.obtenerFecha(newValue);
        }
    });
    //SI EDITAMOS CARGARÁ EL VALOR DE LA FECHA
    $scope.$parent.$watch('fechaEdicion', function(newValue,oldValue) {
        if(newValue){
            $scope.dt = newValue;
        }
    });
});
app.controller('Mensajes', function ($scope, $routeParams, $location, $cookies, servicesConsumer, $filter, Data ) {
    //if ($cookies.logged == "true"){
        if($routeParams.destinatario != null){
            $scope.mensajeDirecto = true;
        };
        servicesConsumer.ConversacionesXUsuario.get({id_usuario:$cookies.idUsuario}, 
            function(res) {
                console.log(res);
                $scope.usuarios = res.response;
                $scope.loadedUsuarios = true;
                if ($scope.usuarios.length > 0) {
                    $scope.existenConversaciones = true;
                    
                    if ($routeParams.destinatarioId) {
                        console.log("hola existe el usuario");
                        idUsuarioCargado = $routeParams.destinatarioId;
                        objetoUsuario = Data.getMensajeObject();
                        //console.log(objetoUsuario);
                    } else {
                        idUsuarioCargado = $scope.usuarios[0].id;
                        $scope.nombreUsuario = $scope.usuarios[0].username;
                    };
                    $scope.miId = $cookies.idUsuario;
                    //SI ESTAMOS EN EL PRIMER MENSAJE DIRECTO+
                    if($routeParams.destinatario == null){
                        if ($routeParams.destinatarioId) {
                            data = {
                                    id_usuario :        $cookies.idUsuario,
                                    id_destinatario:    $routeParams.destinatarioId
                            } 
                        } else {
                            data = {
                                    id_usuario :        $cookies.idUsuario,
                                    id_destinatario:    $scope.usuarios[0].id
                            } 
                        };
                        servicesConsumer.conversacion.get({}, data, 
                            function(res) {
                                $scope.conversacion = res.response;
                                $scope.conversacionCargada = true;
                            }
                        );
                        $scope.existenConversaciones = true;
                    }
                };
            }
        );
        $scope.cargarConversacion = function(iserId, nombreUsario){
            //$scope.mensajeDirecto = false;
            console.log("hopla");
            if (iserId != idUsuarioCargado) {
                $scope.conversacionCargada = false;
                data = {
                    id_usuario:         $cookies.idUsuario,
                    id_destinatario:    iserId
                }
                servicesConsumer.conversacion.get({}, data,  
                    function(res) {
                        $scope.conversacion = res.response;
                        $scope.conversacionCargada = true;
                        idUsuarioCargado = iserId;
                        $scope.nombreUsuario = nombreUsario;
                    }
                );
            };
        };
        $scope.enviarMensaje = function(){
            $scope.enviarMensajeSubmit = true;
            data = {
                id_usuario_remitente:       $cookies.idUsuario,
                id_usuario_destinatario:    idUsuarioCargado,
                mensaje:                    $scope.mensajeBody
            }
            servicesConsumer.enviardm.send({}, data,  
                function(res) {
                    console.log(res);
                    if(res.msg == "Mensaje enviado con ID :"){
                        $scope.conversacion.push({mensaje:$scope.mensajeBody, id_usuario_remitente: $cookies.idUsuario});
                        $scope.mensajeBody = "";
                        $scope.enviarMensajeSubmit = false;
                        $scope.enviarMensajeForm.$setPristine();
                    }
                }
            );
        }; 
        $scope.enviarMensajeDirecto = function(){
            $scope.enviarMensajeDirectoSubmit = true;
            data = {
                id_usuario_remitente:       $cookies.idUsuario,
                id_usuario_destinatario:    $routeParams.destinatario,
                mensaje:                    $scope.primerMensaje
            }
            console.log(data);
            servicesConsumer.enviardm.send({}, data,  
                function(res) {
                    console.log(res);
                    if(res.msg == "Mensaje enviado con ID :"){
                        $scope.mensajeEnviado = true;
                        $scope.primerMensaje = "";
                    }
                }
            );
        };
        console.log($cookies.idUsuario);
    // } else { 
    //     $location.path('/');
    // } 
});
app.controller('Preferencias', function ($scope, $routeParams, servicesConsumer, $location, $cookies) {
        
    //if ($cookies.logged == "true"){
       
        $scope.usuario = $cookies.user;
        $scope.$on('$viewContentLoaded', function() {
            data = {
                    id_usuario: $cookies.idUsuario
            };
            servicesConsumer.obtener.infoUsuario({}, data, function(res){
                $scope.usuario_username = res.response.username;
                $scope.usuario_email = res.response.email;
                $scope.usuario_nombre = res.response.nombre;
                $scope.usuario_paterno = res.response.paterno;
                $scope.usuario_materno = res.response.materno;
            });
        });
        $scope.invalid_password = false;
        $scope.form_success = false;

        $scope.$watch('usuario_password_2', function(newValue,oldValue) {
            if(newValue != $scope.usuario_password_1){
                $scope.invalid_password = true;
            }else{
                $scope.invalid_password = false;
            }
        });

        $scope.$watch('usuario_password_1', function(newValue,oldValue) {
            if(newValue != $scope.usuario_password_2){
                $scope.invalid_password = true;
            }else{
                $scope.invalid_password = false;
            }
        });

        $scope.modificarPreferencias = function(Preferencias){
            if(!$scope.usuario_password_1 || $scope.usuario_password_1==''){
                data = {
                    id: $cookies.idUsuario,
                    email: $scope.usuario_email,
                    nombre: $scope.usuario_nombre,
                    paterno: $scope.usuario_paterno,
                    materno: $scope.usuario_materno,
                    username: $scope.usuario_username
                };
            }else{
                data = {
                    id: $cookies.idUsuario,
                    email: $scope.usuario_email,
                    Password: $scope.usuario_password_1,
                    nombre: $scope.usuario_nombre,
                    paterno: $scope.usuario_paterno,
                    materno: $scope.usuario_materno,
                    username: $scope.usuario_username
                };
            }
            servicesConsumer.usuario.modificar({}, data, function(){
                $scope.form_success = true;
                setTimeout(function(){
                    $scope.form_success = false;
                },3000);
            }, function(){
                console.log("adios");
            });
        } 

    // }else {
    //     $location.path('/');
    // }
});
app.factory('Data', function(){
    var data =
        {
            idUsuario: '',
            estadoLogueado: false
        };
    return {
        getidUsuario: function () {
            return data.idUsuario;
        },
        getNombreUsuario: function () {
            return data.nombreUsuario;
        },
        getEstadoLogueado: function(){
            return data.estadoLogueado;
        },
        getMensajeObject: function(){
            return data.mensajeObject;
        },
        setidUsuario: function (idUsuario) {
            data.idUsuario = idUsuario;
        },
        setNombreUsuario: function (nombreUsuario) {
            data.nombreUsuario = nombreUsuario;
        },
        setEstadoLogueado : function(estadoLogueado){
            data.estadoLogueado = estadoLogueado;
        },
        setMensajeObject : function(mensajeObject){
            data.mensajeObject = mensajeObject;
        }

    };
});
app.controller('Dashboard', function ($scope, $routeParams, $location, $cookies, servicesConsumer, Data) {

    $scope.currentUser = $cookies.idUsuario;
    servicesConsumer.ultimos.obtener({}, function(response){
        console.log(response);
        articulos =response.response;
        $scope.articulos3 = [];
        for (val in articulos){
            val1 = Number(val) + 1;
            articulos[val].idElemento = val;
            if(val1 % 4 == 0 && val1 > 1){
                articulos[val].newRow = true;
            }
            if(val1 % 2 == 0 && val1 > 1){
                articulos[val].newRowMobile = true;
            }
            $scope.articulos3.push(articulos[val]);
        }
        $scope.loadedRecientes = true;              
    }, function(){
        console.log("error");
    }); 
    $scope.editar = function(clave,id){
        if (clave == 1) {
            $location.path('editar/robo/' + id);
        } else if (clave == 2){
            $location.path('editar/hallazgo/' + id);
        } else if (clave == 3){
            $location.path('editar/articulo/' + id);
        };
    }
    $scope.buscarArticulos = function(parametro){
        servicesConsumer.buscar.articulos({parametro:parametro}, function(res) {
            $scope.busquedaCompleta = true;
            $scope.arrayEncotrados = res.response;
        });
    };
    $scope.$watch('buscadorArticulos', function(newValue,oldValue) {
        if (newValue) {
            if(newValue.length > 0){
                console.log(newValue);
                $scope.buscadorEncendido = true;
                $scope.busquedaCompleta = false;
                $scope.arrayEncotrados = $scope.buscarArticulos(newValue);
            }
        };
    });
    $scope.apagarBuscador = function(){
        $scope.buscadorEncendido = false;
        $scope.busquedaCompleta = false;
        $scope.buscadorArticulos = null;
        $scope.arrayEncotrados = [];
    };  
});

app.controller('Reportados', function ($scope, $routeParams, $location, $cookies, servicesConsumer, Data) {

    userIdTemp = $cookies.idUsuario;

    servicesConsumer.siniestros.obtener({id_usuario:userIdTemp}, function(response){
        articulos =response.response;
        $scope.articulos = [];
        for (val in articulos){
            val1 = Number(val) + 1;
            articulos[val].idElemento = val;
            if(val1 % 4 == 0 && val1 > 1){
                articulos[val].newRow = true;
            }
            if(val1 % 2 == 0 && val1 > 1){
                articulos[val].newRowMobile = true;
            }
            $scope.articulos.push(articulos[val]);
        }
        $scope.loadedRobados = true;
    }, function(){
        console.log("error");
    });

});

app.controller('Encontrados', function ($scope, $routeParams, $location, $cookies, servicesConsumer, Data) {

    userIdTemp = $cookies.idUsuario;

    servicesConsumer.hallazgos.obtener({id_usuario:userIdTemp}, function(response){
        articulos =response.response;
        $scope.articulos2 = [];
        for (val in articulos){
            val1 = Number(val) + 1;
            articulos[val].idElemento = val;
            if(val1 % 4 == 0 && val1 > 1){
                articulos[val].newRow = true;
            }
            if(val1 % 2 == 0 && val1 > 1){
                articulos[val].newRowMobile = true;
            }
            $scope.articulos2.push(articulos[val]);
        }
        $scope.loadedHallados = true;              
    }, function(){
        console.log("error");
    });
 
});

app.controller('LlenarClasicaciones', function ($scope, servicesConsumer) {
    servicesConsumer.articulos.clasificacion({}, function(res) {
        $scope.res = res;
        arrayPadres = [];
        arrayPadresRaiz = [];
        for (key in res){
            if(res[key].parent === null){
                arrayPadresRaiz.push(res[key]);
            } else if(res[key].parent != null){
                arrayPadres.push(res[key].parent);
            };
        };
        function removeDuplicates(target_array) {
            target_array.sort();
            var i = 0;
            while(i < target_array.length) {
                if(target_array[i] === target_array[i+1]) {
                    target_array.splice(i+1,1);
                }
                else {
                    i += 1;
                }
            }
            return target_array;
        }
        $scope.arrayPadres = removeDuplicates(arrayPadres);
        $scope.arrayPadresRaiz = arrayPadresRaiz;
        $scope.arraySelectors = [];
        $scope.arraySelectors.push({});
    });
    
    $scope.$on('borraArraySelectors', function(e) {  
        $scope.arraySelectors = [];
        $scope.arraySelectors.push({});
    });
});
app.controller('clasificacionRepeat', function ($scope, servicesConsumer) {
    arrayPadres = $scope.$parent.arrayPadres;
    arrayPadresRaiz = $scope.$parent.arrayPadresRaiz;
    opcionesElementos = $scope.$parent.res;
    if($scope.valor.idPadre == undefined){
        $scope.opcionesDatos = arrayPadresRaiz;
    } else{
        opcionesDatos = [];
        for (val in opcionesElementos){
            if(opcionesElementos[val].parent == $scope.valor.idPadre){
                opcionesDatos.push(opcionesElementos[val]);
            }
        }
        $scope.opcionesDatos = opcionesDatos;
    }
    $scope.$watch('valor', function(newValue,oldValue) {        
        EB = $scope.$parent.arraySelectors.length - $scope.id;
        if (newValue == undefined){
            $scope.style = "has-error";
            $scope.$parent.arraySelectors.splice($scope.id + 1, EB);
            $scope.esconderIdentificadores();
        } else {
            if (newValue.parent == null && newValue.descripcion != null) {
                //SOLO NO EN MODO EDICION
                $scope.ResetIdentificadores();
                $scope.conseguirLlaves(newValue.id);
            };
            $scope.style = "has-waring";
            if (oldValue != undefined){
                $scope.$parent.arraySelectors.splice($scope.id + 1, EB);
            }
            noHijos = true;
            for (val in arrayPadres){
                if(newValue.id == arrayPadres[val]){
                    $scope.$parent.arraySelectors.push({idPadre : newValue.id });
                    noHijos = false;
                }
            }
            if(noHijos == true && newValue.descripcion != undefined){
                $scope.style = "has-success";
                $scope.$parent.darvalorFinal(newValue);
            }
            if (!newValue.id) {
                $scope.style = "";
                $scope.esconderIdentificadores();
            };
        }
    });
    $scope.conseguirLlaves = function(id){
        servicesConsumer.conseguirLlaves.send({id_parent:id}, function(res) { 
            $scope.llenarReglas(res.response);
        }, function(){
            console.log("error");
        });

    };
});
app.controller('editarReporte', function ($scope, $routeParams, $location, $route, $cookies, servicesConsumer, $filter, $fileUploader, modalService, $timeout ) {
    
    //if ($cookies.logged == "true"){
        
        //$scope.$on('$viewContentLoaded', function() {
            var latitud;
            var longitud;
            $scope.NoIdentificadores = 0;
            $scope.modoEdicion = true;
            $scope.editarReporteSubmit = false;
            $scope.agregarArticulo = false;
            $scope.articuloCreado = false;
            $scope.valorFinal = null;
            
            $scope.tipo =  $location.path().split("/")[2];

            //SI ESTAMOS EN UN NUEVO REPORTE
            if($routeParams.idReporte == null){
                $scope.cargandoReporteFinalizado = true;
                $scope.edicion = false;
                EDICION = false;
            } else {
            //SI ESTAMOS EN MODO EDICION
                $scope.cargandoReporteFinalizado = false;
                EDICION = true;
                $scope.edicion = true;
                $scope.idReporte = $routeParams.idReporte;
                servicesConsumer.obtenerReporte.porId({idReporte:$routeParams.idReporte}, function(response){
                    articulos = response.response.FMO_ARTICULOS;
                    $scope.latitud = response.response.FMO_REPORTE.latitud;
                    $scope.longitud = response.response.FMO_REPORTE.longitud;
                    $scope.cpNumero = response.response.FMO_REPORTE.FMO_CP.codigo;
                    if(response.response.FMO_REPORTE.FMO_CP.id == 6){
                        $scope.modoEdicion = false;
                        $scope.municipio = response.response.FMO_REPORTE.FMO_CP.municipio;
                        $scope.estado = response.response.FMO_REPORTE.FMO_CP.estado;
                        $scope.estadoDisponible = true;
                        $scope.municipioDisponible = true;
                    }
                    $scope.fechaEdicion = new Date(response.response.FMO_REPORTE.fecha_reporte);
                    $scope.descripcionEvento = response.response.FMO_REPORTE.descripcion;
                    $scope.fechaCreacion = response.response.FMO_REPORTE.fecha_creacion;
                    //si no existen aún artículos agregarlos
                    if (articulos.length == 0){  
                        $scope.agregarArticulos = true;
                    } else{
                        $scope.articulos = [];
                        for (val in articulos){
                            val1 = Number(val) + 1;
                            articulos[val].idElemento = val;
                            if(val1 % 4 == 0 && val1 > 1){
                                articulos[val].newRow = true;
                            }
                            if(val1 % 2 == 0 && val1 > 1){
                                articulos[val].newRowMobile = true;
                            }
                            $scope.articulos.push(articulos[val]);
                        }
                        $scope.agregarArticulos = false;
                    }
                    $scope.cargandoReporteFinalizado = true;
                }, function(){
                    console.log("error");
                });
            }

            $scope.articuloValido = {valido:false};
            $scope.fooCollection = [];
            $scope.valoresIdentificadores = [];
            $scope.valoresIdentificadores.push({ nombre: "", valor: "", valido : false});
            $scope.fooCollection.push([]);
            $scope.idArticulo = null;
            $scope.alMenosUnArticulo = false;
            $scope.articulosListado = [];
            $scope.datosBasicos = true;
            
        //});
        $scope.llenarReglas = function(array){
            $scope.arrayObligatorios = [];
            for(val in array){
                $scope.arrayObligatorios.push({value: array[val].descripcion, label:array[val].descripcion});
            };           
            for (val in $scope.arrayObligatorios){
                $scope.fooCollection.push({ obligatorio : true, nombre: "", valor: "", valido : false });
            };
        };
        //RESETEAMOS LOS IDENTIFICADORES
        $scope.ResetIdentificadores = function(){
            $scope.fooCollection = [];
        };
        $scope.editarReporteFunction = function(){

            $scope.editarReporteSubmit = true;
            $scope.editarSuccess = false;
            //conseguimos fechas, actual y del reporte
            fechaSiniestro = $scope.fechaSiniestro.toISOString().substr(0, 19);
            var fechaActual = new Date();
            fechaActual = fechaActual.toISOString().substr(0, 19);
            if ($scope.idCP == null){
                $scope.idCP = 6;
            }
            data = {
                    id:             $routeParams.idReporte,
                    id_usuario:     $cookies.idUsuario,
                    fecha_reporte:  fechaSiniestro,
                    id_cp:          $scope.idCP,
                    delegacion:     $scope.municipio,
                    estado:         $scope.estado,
                    descripcion:    $scope.descripcionEvento,
                    fecha_creacion: $scope.fechaCreacion,
                    latitud :       latitud,
                    longitud:       longitud
            };
            if (EDICION == true) {
                servicesConsumer.modificarEvento.reporte({}, data, function(res) {
                    $scope.editarSuccess = true;
                }, function(){
                    console.log("error");
                });
            } else {
                var fechaActual = new Date();
                fechaActual = fechaActual.toISOString().substr(0, 19);
                data.fecha_creacion = fechaActual;
                //ROBO
                if ($location.path() == "/reporte/robo"){
                    console.log(data);                    
                    servicesConsumer.reportar.siniestro({}, data, function(res) {
                        console.log(res)
                        if (res.msg == "Reporte Siniestro creado con Id"){                                
                            $scope.idReporte = res.response;
                            $scope.editarSuccess = true;
                            $scope.agregarArticulo = true;
                        }
                    }, function(){
                        console.log("Error");
                    });
                //HALLAZGO
                } else if($location.path() == "/reporte/hallazgo"){
                    servicesConsumer.hallazgo.reportar({}, data, function(res) {
                        console.log(res)
                        if (res.msg == "Reporte Hallazgo creado con Id"){                                
                            $scope.idReporte = res.response;
                            $scope.editarSuccess = true;
                            $scope.agregarArticulo = true;
                            console.log("creado");
                        }
                    }, function(){
                        console.log("Error");
                    });
                }
            };
        }

        $scope.crearArticuloFunction = function(isValid) {
            catArticulo = $scope.opciones;
            $scope.crearArticuloSubmit = true;
            identificadoresValores = [];
            $scope.fooCollection.forEach(function(identificador) {
                identificadoresValores.push({descripcion : identificador.descripcion, identificador: identificador.identificador});
            });
            if (EDICION == true) {
                $scope.idReporte = $routeParams.idReporte;
            };
            if ($scope.tipo == "robo") {
                url = "/rest/api/articulo/siniestro/";
            } else {
                url = "/rest/api/articulo/hallazgo/";
            };
            if($scope.recompensa != null || $scope.recompensa != undefined || $scope.recompensa > 0){
                estadoRecompensa = 1;
                montoRecompensa = $scope.recompensa;
            } else {
                estadoRecompensa = 0;
                montoRecompensa = null;
            }
            data = {
                id_usuario:         $cookies.idUsuario,
                id_reporte:         $scope.idReporte,
                id_cat_articulo:    catArticulo,
                marca:              $scope.marca,
                modelo:             $scope.modelo,
                descripcion:        $scope.descripcion,
                identificadores:    identificadoresValores,
                id_cat_recompensa:  estadoRecompensa,
                monto:              montoRecompensa
            };
            $.ajax({
                type: 'POST',
                url: url,
                data: data,
                dataType: 'json',
                success: function(responseData, textStatus, jqXHR) {
                    if (responseData.msg == "Articulo Creado con Id") {
                        $scope.$apply(function () {
                            $scope.articuloCreado = true;
                            $scope.alMenosUnArticulo = true;
                            $scope.articulosListado.push({nombre: $scope.modelo + " " + $scope.marca, id: responseData.response });
                            $scope.CurretArticulo = $scope.modelo + " " + $scope.marca;
                            $scope.idArticulo = responseData.response;
                            $scope.lanzarImageLoad();
                        });
                    } else{
                        console.log("cambios");
                    };
                },
                error: function (responseData, textStatus, errorThrown) {
                    console.log("adios");
                }
            });
        }
        $scope.editarItem = function(idTipo, idItem){
            if (idTipo == 1) {
                path = $scope.tipo;
                if ($scope.editar == false){
                    $location.path("/editar/" + path + "/" + idItem);
                } else {
                    $route.reload();
                };
            } else if (idTipo == 2){
                $location.path("/editar/articulo/" + idItem);
            };
        };
        $scope.addNewArticulo = function(){
            $scope.$broadcast ('borraArraySelectors');
            $scope.limpiarAgregarArticuloFormulario();
            $scope.articuloCreado = false;
            $scope.CurretArticulo = null;
            $scope.articuloValido.valido = true;
            $scope.crearArticuloSubmit = false;
            $scope.arraySelectors = [];
            $scope.arraySelectors.push({valor:"nuevo"});
        }
        $scope.limpiarAgregarArticuloFormulario = function(){
            $scope.opciones = "";
            $scope.marca = "";
            $scope.modelo = "";
            $scope.recompensa = "";
            $scope.descripcion = "";
            $scope.valoresIdentificadores = [];
            $scope.fooCollection = [];
            $scope.NoIdentificadores = 0;
            $scope.fooCollection.push({id : null});
            $scope.valoresIdentificadores.push({ nombre: "", valor: "", valido : false});
            $scope.crearArticulo.$setPristine();
        };
        $scope.lanzarImageLoad = function(){
            $scope.url = "/rest/api/imagen/upload?id_articulo=" + $scope.idArticulo;
            var uploader = $scope.uploader = $fileUploader.create({
                scope: $scope,
                url: $scope.url
            });
            // ADDING FILTERS
            uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
                var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                $scope.idArticulo = $scope.$parent.idArticulo;
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            });
        }
        $scope.obtenerFecha = function(newVal) {
            $scope.fechaSiniestro = newVal;
        };
        $scope.darvalorFinal = function(newVal) {
            $scope.opciones = newVal.id;
            $scope.marca = newVal.descripcion;
            $scope.mostrarIdentificadores = true;
            valor = newVal.descripcion;
            //.toUpperCase()
            if (valor == "Otro" || valor == "OTRO" || valor == "otro"){
                $scope.esconderMarca = true;
                $scope.marca = "";
            } else {
                $scope.esconderMarca = false;
            }
        };
        $scope.esconderIdentificadores = function(){
            $scope.mostrarIdentificadores = false;
            console.log("esconder identificadores");
        };
        $scope.addOption = function (){
                $scope.fooCollection.push({id : null});
        };
        $scope.getIndexIdentificador = function(){
            $scope.NoIdentificadores ++;
            return $scope.NoIdentificadores - 1;
        };
        $scope.verValidezIdentificadores = function(){
            Valido = true;
            if ($scope.fooCollection.length > 0) {
                for(val in $scope.fooCollection){
                    if ($scope.fooCollection[val].valido == false){
                       Valido = false; 
                    }
                };
                $scope.articuloValido.valido = Valido;
            } else {
                $scope.articuloValido.valido = false;
            }; 
        };
        $scope.eliminarIdentificador = function(key){
            $scope.fooCollection.splice(key, 1);
            $scope.articuloValido.valido = true;            
            $scope.verValidezIdentificadores();
        };
        $scope.lanzarImagen = function(header, url){
            var modalOptions = {
                headerText: header,
                imagenUrl: url
            };
            modalService.showModal({}, modalOptions);
        };
        $scope.$watch('cargandoReporteFinalizado', function(newValue,oldValue) {
            if(newValue == true){
                $timeout(function(){
                    if ($routeParams.idReporte == null) {
                        initializeMapa();
                    } else {
                        initializeMapa($scope.latitud, $scope.longitud);
                    };
                }, 100);            
            };
        });    

    // } else { 
    //     $location.path('/');
    // } 
});
app.controller('editArticulo', function ($scope, $routeParams, $location, $cookies, servicesConsumer, $filter, $fileUploader, modalService ) {
    
    //if ($cookies.logged == "true"){
        //$scope.$on('$viewContentLoaded', function() {
            $scope.CargaFinalizada = false; 
            servicesConsumer.obtenerArticulo.porId({idReporte:$routeParams.idArticulo}, function(res) {
                
                $scope.recompensa = res.monto;
                $scope.articulo = res;
                $scope.descripcion = res.descripcion;
                $scope.marca = res.marca;
                $scope.modelo = res.modelo;
                $scope.reclasificar = false;
                $scope.clasificacionDada = res.FMO_CAT_ARTICULO.descripcion;
                $scope.clasificacionId = res.FMO_CAT_ARTICULO.id;
                $scope.idReporte = res.id_reporte;
                $scope.imagenes = res.FMO_ARTICULO_IMAGEN;
                $scope.opcionesIdentificadores = opcionesIdentificadores;
                $scope.NoIdentificadores = 0;
                $scope.currentIndex = 0;
                $scope.articuloValido = {valido:true};
                $scope.fooCollection = [];
                $scope.borrarColeccion = [];
                $scope.esconderMarca = false;
                
                for (val in res.FMO_IDENTIFICADOR_ARTICULO){
                    if (res.FMO_IDENTIFICADOR_ARTICULO[val].descripcion != "BORRADO") {
                        $scope.fooCollection.push({ id_articulo:res.FMO_IDENTIFICADOR_ARTICULO[val].id_articulo,id:res.FMO_IDENTIFICADOR_ARTICULO[val].id, descripcion:res.FMO_IDENTIFICADOR_ARTICULO[val].descripcion, identificador:res.FMO_IDENTIFICADOR_ARTICULO[val].identificador, nombre: "", valor: "", valido : false, edicion : true });
                        $scope.id_articulo = res.FMO_IDENTIFICADOR_ARTICULO[val].id_articulo;
                    };
                }
                $scope.CargaFinalizada = true; 
            });
        //});
        $scope.llenarReglas = function(array){
            $scope.arrayObligatorios = [];
            for(val in array){
                $scope.arrayObligatorios.push({label: array[val].descripcion, label:array[val].descripcion});
            };
        };
        $scope.ResetIdentificadores = function(){
            //$scope.fooCollection = [];
        };
        $scope.addOption = function (){
            $scope.fooCollection.push({id : null});
        };
        $scope.reclasificarFuncion = function(){
            $scope.reclasificar = true;
            $scope.marca = "";
        };
        $scope.darvalorFinal = function(newVal) {
            if ($scope.reclasificar == true) {
                $scope.opciones = newVal.id;
                $scope.marca = newVal.descripcion;
                valor = newVal.descripcion;
                if (valor == "Otro" || valor == "OTRO" || valor == "otro"){
                    $scope.esconderMarca = true;
                    $scope.marca = "";
                } else {
                    $scope.esconderMarca = false;
                }
            }
        };
        $scope.esconderIdentificadores = function(){
        };
        $scope.editarArticulo = function () {
            if($scope.recompensa != null || $scope.recompensa != undefined || $scope.recompensa > 0){
                estadoRecompensa = 1;
                montoRecompensa = $scope.recompensa;
            } else {
                estadoRecompensa = 0;
                montoRecompensa = null;
            }
            //SI NO SE HA TOCADO LA CLASIFICACION
            if ($scope.reclasificar == false){
                catArticulo = $scope.clasificacionId;
            } else {
                catArticulo = $scope.opciones;
            };
            identificadoresValores = [];
            $scope.fooCollection.forEach(function(identificador) {
                if(identificador.id){
                    accionATomar = "change";
                    identificadoresValores.push({descripcion : identificador.descripcion, identificador: identificador.identificador, accion: accionATomar, id:identificador.id, id_articulo: $scope.id_articulo})
                } else {
                    accionATomar = "new";
                    identificadoresValores.push({descripcion : identificador.descripcion, identificador: identificador.identificador, accion: accionATomar, id_articulo: $scope.id_articulo});
                }
            });
            $scope.borrarColeccion.forEach(function(identificador) {
                identificadoresValores.push({descripcion : "BORRADO", identificador: "----", accion: "change", id:identificador.id, id_articulo: identificador.id_articulo});

            });
            $.ajax({
                type: 'PUT',
                url: '/rest/api/Articulo/',
                data: {
                            id:                 $routeParams.idArticulo,
                            id_usuario:         $cookies.idUsuario,
                            id_reporte:         $scope.idReporte,
                            id_cat_articulo:    catArticulo,
                            marca:              $scope.marca,
                            modelo:             $scope.modelo,
                            descripcion:        $scope.descripcion,
                            identificadores:    identificadoresValores,
                            //editados recompensa
                            id_cat_recompensa:  estadoRecompensa,
                            monto:              montoRecompensa
                },
                dataType: 'json',
                success: function(responseData, textStatus, jqXHR) {
                    console.log(responseData);
                    //si la respuesta es positiva
                    if (responseData.msg == "Actualizado id: ") {
                        $scope.$apply(function () {
                            $scope.articuloCreado = true;
                            $scope.idArticulo = responseData.response;
                            $scope.lanzarImageLoad();
                            $scope.editarReporteSubmit = true;
                        });
                    } else{
                        console.log("cambios");
                    };
                },
                error: function (responseData, textStatus, errorThrown) {
                    console.log("adios");
                }
            });
        };
        $scope.lanzarImageLoad = function(){
            $scope.url = "/rest/api/imagen/upload?id_articulo=" + $scope.idArticulo;
            var uploader = $scope.uploader = $fileUploader.create({
                scope: $scope,
                url: $scope.url
            });
            uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
                var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            });
        }
        $scope.eliminarIdentificador = function(key){
            if ($scope.fooCollection[key].id != null) {
                $scope.borrarColeccion.push($scope.fooCollection[key]);
            };
            $scope.fooCollection.splice(key, 1);
            $scope.articuloValido.valido = true;            
            $scope.verValidezIdentificadores();

        };
        $scope.verValidezIdentificadores = function(){
            Valido = true;
            if ($scope.fooCollection.length > 0) {
                for(val in $scope.fooCollection){
                    if ($scope.fooCollection[val].valido == false){
                       Valido = false; 
                    }
                };
                $scope.articuloValido.valido = Valido;
            } else {
                $scope.articuloValido.valido = false;
            }; 
        };
        $scope.lanzarImagen = function(header, url){
            var modalOptions = {
                headerText: header,
                imagenUrl: url
            };
            modalService.showModal({}, modalOptions);
        };

    // } else { 
    //     $location.path('/');
    // } 
});
app.controller('DetallesArticulo', function ($scope, $routeParams, $location, $cookies, $filter, servicesConsumer,modalService, $timeout) {
    //if ($cookies.logged == "true"){
        $scope.cargandoReporteFinalizado = false;
        $scope.currentUserId = $cookies.idUsuario;
        servicesConsumer.obtenerArticulo.porId({idReporte:$routeParams.idArticulo}, function(res) {
            $scope.articulo = res;
            $scope.reporte = res.FMO_REPORTE;
            if ($scope.articulo.FMO_CAT_ARTICULO.descripcion.toLowerCase() == $scope.articulo.marca.toLowerCase()) {
                $scope.marcaRedundante = true;
            };
            $scope.editar = function(id){
                $location.path('editar/articulo/' + id);
            }
            $scope.editarReporte = function(tipo,id){
                if(tipo == "Hallazgo"){
                    var1 = "hallazgo";
                } else {
                    var1 = "robo";
                }
                $location.path('editar/'+ var1 + '/' + id);
            }
            $scope.cargandoReporteFinalizado = true;
        });
        $scope.lanzarImagen = function(header, url){
            var modalOptions = {
                headerText: header,
                imagenUrl: url
            };
            modalService.showModal({}, modalOptions);
        };
        $scope.$watch('cargandoReporteFinalizado', function(newValue,oldValue) {
            if(newValue == true){
                if ($scope.reporte.latitud) {
                    $timeout(function(){
                        initializeMapa($scope.reporte.latitud,$scope.reporte.longitud,true);
                    }, 100);  
                };          
            };
        });
    // } else { 
    //     $location.path('/');
    // } 
});
app.controller('DetallesReporte', function ($scope, $routeParams, $location, $cookies, servicesConsumer, $filter, modalService, $timeout) {
    //console.log("aqui estoy");
    //if ($cookies.logged == "true"){
        $scope.cargandoReporteFinalizado = false;
        $scope.currentUserId = $cookies.idUsuario;
        servicesConsumer.obtenerReporte.porId({idReporte:$routeParams.idReporte}, function(response){
            $scope.reporte = response.response.FMO_REPORTE;
            $scope.articulos = response.response.FMO_ARTICULOS;
            if ($scope.reporte.FMO_CAT_REPORTE.descripcion == "Siniestro") {
                $scope.clave = "robo";
            } else if ($scope.reporte.FMO_CAT_REPORTE.descripcion == "Hallazgo") {
                $scope.clave = "hallazgo";
            };
            $scope.cargandoReporteFinalizado = true;
        });
        $scope.editar = function(id){
            if ($scope.clave == "robo") {
                $location.path('editar/'+$scope.clave+'/' + id);
            } else if ($scope.clave == "hallazgo"){
                $location.path('editar/'+$scope.clave+'/' + id);
            };
        };
        $scope.lanzarImagen = function(header, url){
            var modalOptions = {
                headerText: header,
                imagenUrl: url
            };
            modalService.showModal({}, modalOptions);
        };
        $scope.$watch('cargandoReporteFinalizado', function(newValue,oldValue) {
            if(newValue == true){
                if ($scope.reporte.latitud) {
                    $timeout(function(){
                        initializeMapa($scope.reporte.latitud,$scope.reporte.longitud,true);
                    }, 100);
                };            
            };
        });
    // } else { 
    //     $location.path('/');
    // } 
});
app.controller('Contacto', function ($scope, $cookies, servicesConsumer, $timeout) {
    //if ($cookies.logged == "true"){
        $scope.usuarioValido = true;
        $scope.cargandoInfoFinalizado = false;
        servicesConsumer.obtener.infoUsuario({id_usuario: $cookies.idUsuario}, function(res){
            console.log(res);
            $scope.usuario = res.response;
            $scope.cargandoInfoFinalizado = true;
        });
    // } else { 
    //     $scope.usuarioValido = false;
    //     $scope.cargandoInfoFinalizado = true;
    // };
    $scope.stuff = function(){
        data = {
            nombreRemitente:        $scope.usuario.nombre,
            emailremitente:         $scope.usuario.email,
            asunto:                 $scope.usuario.mensaje,   
            mensaje:                $scope.usuario.mensaje
        }
        servicesConsumer.mail.enviar({}, data, function(res){
            console.log(res);
        });

        $scope.mensajeEnviado = true;
    };
    $scope.contactar = function(){
        $scope.contactoSubmit = true;
        $timeout($scope.stuff, 400);
        
    }
});
app.controller('Robosreportados', function ($scope, $cookies, servicesConsumer, $location) {
    //if ($cookies.logged == "true"){
        usuario = $cookies.idUsuario;
        servicesConsumer.obtenerSiniestros.porUsuario({id_usuario: usuario}, function(res){
            $scope.msg = res.msg;
            $scope.reportes = res.response;
            $scope.reportesCargados = true;
        });
        $scope.editar = function(id){
            $location.path( 'editar/robo/' + id );
        };
    // } else { 
    //     $location.path('/');
    // } 
});
app.controller('Hallazgosreportados', function ($scope, $cookies, servicesConsumer, $location) {
    //if ($cookies.logged == "true"){
        console.log("mono");
        usuario = $cookies.idUsuario;
        servicesConsumer.obtenerHallazgos.porUsuario({id_usuario: usuario}, function(res){
            $scope.msg = res.msg;
            $scope.reportes = res.response;
            $scope.reportesCargados = true;
        });
        $scope.editar = function(id){
            $location.path( 'editar/hallazgo/' + id );
        };
    // } else { 
    //     $location.path('/');
    // } 
});