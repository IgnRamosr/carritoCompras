/*!
* Start Bootstrap - Shop Homepage v5.0.6 (https://startbootstrap.com/template/shop-homepage)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-shop-homepage/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

document.addEventListener("DOMContentLoaded", function () {
    actualizaContCarrito();
    var detallesContainer = document.getElementById("detalles-container");


    // Asignar un controlador de eventos al contenedor principal
    document.body.addEventListener('click', function(event) {
        // Verificar si el clic fue en un botón de detalles
        if (event.target.classList.contains('detalles-btn')) {
            var idProducto = event.target.getAttribute('data-id');

            fetch(`/detalle_producto/${idProducto}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(producto => {

                apareceModal(
                    detallesContainer,
                    producto.id,
                    producto.precio,
                    producto.descripcion,
                    producto.imagen,
                    producto.cantidad
                );
            })
            .catch(error => console.error('Error al obtener los datos del producto:', error));
        }
    });

    document.body.addEventListener('click', async function(event) {
        // Verificar si el clic fue en un botón "Agregar al Carrito"
        if (event.target.classList.contains('agregar-carrito-btn')) {
            // Obtener el ID del producto del atributo data del botón clicado
            const idProducto = event.target.getAttribute('data-id');
    
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            let productoEnCarrito = carrito.find(producto => producto && producto.id === idProducto);
            let cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;
    
    
            // Realizar una solicitud Fetch para obtener los detalles del producto
            try {
                const response = await fetch(`/detalle_producto/${idProducto}/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const producto = await response.json();
    
                // Verificar si la cantidad deseada no supera el stock disponible
                if (cantidad < producto.cantidad) {
                    // Incrementar la cantidad según la lógica establecida
                    cantidad++;
    
                    // Verificar si la cantidad deseada es mayor que el stock disponible
                    if (cantidad > producto.cantidad) {
                        // Mostrar un mensaje de alerta al usuario
                        alert(`No puedes agregar más del stock disponible (${producto.cantidad}).`);
                        return; // Salir de la función sin agregar el producto al carrito
                    }
    
                    // Actualizar la cantidad del producto en el objeto carrito
                    carrito[idProducto] = cantidad;
    
                    // Guardar el objeto carrito en el Local Storage
                    localStorage.setItem('carrito', JSON.stringify(carrito));
    
                    // Crear un objeto producto con la información obtenida
                    const detalleProducto = {
                        id: idProducto,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        imagen: producto.imagen,
                        cantidad: 1,
                    };
    
                    // Llamar a la función agregarCarrito con el producto obtenido como parámetro
                    agregarCarrito(detalleProducto);
                } else {
                    // Informar al usuario que la cantidad deseada supera el stock disponible
                    alert(`La cantidad deseada para ${producto.nombre} supera el stock disponible (${producto.cantidad}).`);
                }
            } catch (error) {
                console.error('Error al obtener los datos del producto:', error);
            }
        }
    });
    
    
    // Obtener las cantidades del Local Storage al cargar la página
    const carritoLocalStorage = JSON.parse(localStorage.getItem('carrito')) || [];
    for (const productoEnCarrito of carritoLocalStorage) {
        if (productoEnCarrito) {
            const idProducto = productoEnCarrito.id;
            // Actualizar el valor de data-cantidad en todos los botones
            document.querySelectorAll(`.agregar-carrito-btn[data-id="${idProducto}"]`).forEach(button => {
                button.setAttribute('data-cantidad', productoEnCarrito.cantidad);
            });
        }
    }
    
    


    document.getElementById('btn_carrito').addEventListener('click', async function (event) {
        event.preventDefault(); // Evita la recarga de la página

        // Obtén el carrito actual del localStorage (si existe)
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        

        // Sumar las cantidades de los elementos en el carrito
        const totalCantidades = carrito.reduce((total, detalleProducto) => {
            if (detalleProducto) {
                return total + detalleProducto;
            } else {
                return total;
            }
        }, 0);
        
    
        // Verifica si la cantidad en el carrito es cero
        if (totalCantidades === 0) {
            alert('No tienes artículos en el carrito.');
        } else {
            const carritoContainer = document.getElementById('carritoContainer');
    
            // Obtén el contenido del carrito como cadena de texto HTML
            const contenidoCarritoHTML = await generarContenidoCarrito();
    
            // Asigna el contenido al contenedor del carrito
            carritoContainer.innerHTML = contenidoCarritoHTML;
    
            // Muestra el contenedor del carrito y aplica la animación
            carritoContainer.style.display = 'block';

            const enlacesEliminar = document.querySelectorAll('.eliminar-producto');
            if (enlacesEliminar.length > 0) {
                enlacesEliminar.forEach(enlace => {
                    enlace.addEventListener('click', async function (event) {
                        event.preventDefault();
                        const idProducto = this.getAttribute('data-id');
            
                        // Eliminar el producto directamente dentro del manejador de eventos
                        // Obtener el carrito actual del localStorage (si existe)
                        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            
                        // Filtrar el producto a eliminar
                        carrito = carrito.filter(producto => producto.id !== idProducto);
            
                        // Guardar el carrito actualizado en el localStorage
                        localStorage.setItem('carrito', JSON.stringify(carrito));
            
                        // Actualizar el contador del carrito en la interfaz
                        actualizaContCarrito();
            
                        // Volver a generar el contenido del carrito después de la eliminación
                        const carritoContainer = document.getElementById('carritoContainer');
                        if (carritoContainer) {
                            const contenidoCarritoHTML = await generarContenidoCarrito();
                            carritoContainer.innerHTML = contenidoCarritoHTML;
                            asignarEventosVolverTienda();
                            await asignarEventoEliminarProducto();
            
                            // Agregar de nuevo los manejadores de eventos a los botones de suma y resta
                            document.querySelectorAll('.resta-btn').forEach(button => {
                                button.addEventListener('click', function () {
                                    updateCantidad(this, -1, function () {
                                        actualizaContCarrito();
                                        actualizarTotalEnPantalla();
                                    });
                                });
                            });
            
                            document.querySelectorAll('.suma-btn').forEach(button => {
                                button.addEventListener('click', function () {
                                    updateCantidad(this, 1, function () {
                                        actualizaContCarrito();
                                        actualizarTotalEnPantalla();
                                    });
                                });
                            });
                        }
                    });
                });
            }else {
                // Ocultar el contenedor del carrito si no hay enlaces para eliminar
                const carritoContainer = document.getElementById('carritoContainer');
                if (carritoContainer) {
                    carritoContainer.style.display = 'none';
                }
            }
            

            function actualizarTotalEnPantalla() {
                const totalLabel = document.getElementById('totalLabel');
                if (totalLabel) {
                    totalLabel.textContent = `CLP ${calcularTotal()}`;
                }
            }
    
            // Agrega un evento de clic al enlace "Volver a la tienda"
            const volverTiendaLink = document.getElementById('volver_btn');
    
            // Verifica si el elemento existe antes de intentar agregar el evento
            if (volverTiendaLink) {
                volverTiendaLink.addEventListener('click', function(event) {
                    event.preventDefault(); // Evita el comportamiento predeterminado del enlace
    
                    // Oculta la sección del carrito
                    const carritoSection = document.getElementById('carritoContainer');
                    if (carritoSection) {
                        carritoSection.style.display = 'none';
                    }
                });
            }
    
            function updateCantidad(button, incremento, callback) {
                const cantidadInput = button.parentNode.querySelector('input[type=number]');
            
                // Verificar que el valor del input sea un número válido
                const inputCantidad = parseInt(cantidadInput.value, 10);
                if (!isNaN(inputCantidad)) {
                    let nuevaCantidad = inputCantidad + incremento;
                    // Obtener el ID del producto directamente desde el detalleProducto
                    const idProducto = cantidadInput.getAttribute('data-id');
            
                    // Obtener el stock disponible del producto
                    obtenerStockDisponible(idProducto)
                        .then(stockDisponible => {
            
                            // Verificar si la nueva cantidad supera el stock disponible
                            if (nuevaCantidad >= stockDisponible) {
                                // Si supera el stock o es igual, ocultar el botón de suma
                                const sumaButton = button.parentNode.querySelector('.suma-btn');
                                if (sumaButton) {
                                    sumaButton.style.display = 'none';
                                }
                            } else {
                                // Si no supera el stock, mostrar el botón de suma
                                const sumaButton = button.parentNode.querySelector('.suma-btn');
                                if (sumaButton) {
                                    sumaButton.style.display = 'inline-block';
                                }
                            }
            
                            // Verificar si la nueva cantidad es uno para ocultar el botón de resta
                            const restaButton = button.parentNode.querySelector('.resta-btn');
                            if (restaButton) {
                                restaButton.style.display = nuevaCantidad === 1 ? 'none' : 'inline-block';
                            }
            
                            // Verificar que la nueva cantidad no sea negativa
                            nuevaCantidad = Math.max(1, nuevaCantidad);
            
                            // Actualizar el valor del campo de entrada
                            cantidadInput.value = nuevaCantidad;
            
                            // Actualizar la cantidad en el carrito y en el Local Storage
                            actualizarCantidadCarrito(idProducto, nuevaCantidad);
            
                            // Llamar al callback después de realizar todas las actualizaciones
                            if (callback) {
                                callback();
                            }
                        })
                        .catch(error => {
                            console.error('Error al obtener el stock del producto:', error);
                        });
                } else {
                    console.error('El valor del input no es un número válido.');
                }
            
                function obtenerStockDisponible(idProducto) {
                    return fetch(`/detalle_producto/${idProducto}/`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(producto => producto.cantidad)
                        .catch(error => {
                            console.error('Error al obtener el stock del producto:', error);
                            return 0; // Otra acción en caso de error
                        });
                }
            }
            

            function actualizarCantidadCarrito(idProducto, nuevaCantidad) {
                // Obtener el carrito actual del localStorage (si existe)
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
                // Buscar el producto en el carrito por su ID
                const productoEnCarrito = carrito.find(producto => producto && producto.id === idProducto);
    
                // Verificar si se encontró el producto en el carrito
                if (productoEnCarrito) {
                    // Actualizar la cantidad del producto en el carrito
                    productoEnCarrito.cantidad = nuevaCantidad;
    
                    // Guardar el carrito actualizado en el localStorage
                    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    
                    // Actualizar el contador del carrito en la interfaz
                    actualizaContCarrito();
                }
            }
            
            document.querySelectorAll('.resta-btn').forEach(button => {
                button.addEventListener('click', function() {
                    updateCantidad(this, -1, function() {
                        actualizaContCarrito();
                        actualizarTotalEnPantalla();
                    });
                });
            });
            
            document.querySelectorAll('.suma-btn').forEach(button => {
                button.addEventListener('click', function() {
                    updateCantidad(this, 1, function() {
                        actualizaContCarrito();
                        actualizarTotalEnPantalla();
                    });
                });
            });
        }
    });
    
});





function apareceModal(container, id, precio, descripcion, imagen, cantidad) {
    

    // Crear la capa de fondo oscuro
    var fondoOscuro = document.createElement('div');
    fondoOscuro.classList.add('fondo-oscuro');
    document.body.appendChild(fondoOscuro);
    fondoOscuro.style.position = 'fixed';
    fondoOscuro.style.top = '0';
    fondoOscuro.style.left = '0';
    fondoOscuro.style.width = '100%';
    fondoOscuro.style.height = '100%';
    fondoOscuro.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    fondoOscuro.style.zIndex = '1000';
    fondoOscuro.style.display = 'none';

    container.classList.add('visible');
    
    // Cambiar el estilo para mostrar el contenedor
    container.innerHTML = `
    <section class="h-100">
        <div class="container py-5 modal-container">
            <div class="row justify-content-center align-items-center">
                <div class="col-lg-7">
                    <div class="card" style="max-height: 80vh;">
                        <div class="card-body p-4 overflow-auto">
                            <h5 class="mb-3">
                                <a href="#!" class="text-body continuar-comprando">
                                    <i class="fas fa-long-arrow-alt-left me-2"></i>Continuar comprando
                                </a>
                            </h5>
                            <hr>
                            <img src="${imagen}" alt="Product Image" class="img-fluid mt-3">
                            <div class="mt-3">
                                <h6>Precio:</h6>
                                <p>${precio}</p> 
                                <h6>Cantidad en stock:</h6>
                                <p id="stockQuantity">${cantidad}</p>
                                <h6>Descripción:</h6>
                                <p>${descripcion}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;


    container.style.display = "block";
    fondoOscuro.style.display = "block";

    // Agregar un controlador de eventos para "Continuar comprando"
    var continuarComprandoBtn = container.querySelector('.continuar-comprando');
    var contenedorPrincipal = container.querySelector('.modal-container');

    continuarComprandoBtn.addEventListener('click', function() {
        // Ocultar el modal
        ocultarModal(container);
    });

    // Agregar un controlador de eventos para hacer clic en el fondo oscuro
    fondoOscuro.addEventListener('click', function() {
        // Ocultar el modal
        ocultarModal(container, fondoOscuro);
    });

    // Agregar un controlador de eventos para hacer clic en el contenedor principal
    contenedorPrincipal.addEventListener('click', function(event) {
        // Verificar si el clic fue en el contenedor principal
        if (event.target === contenedorPrincipal) {
            // Ocultar el modal
            ocultarModal(container);
        }
    })
    // Función para ocultar el modal
    function ocultarModal(container) {
        container.classList.remove('visible');
        container.innerHTML = '';  // Limpiar el contenido del modal
        document.body.removeChild(fondoOscuro);
}
}

function agregarCarrito(item) {
    // Obtener el carrito actual del localStorage (si existe)
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Verificar si el artículo ya está en el carrito
    const productoEnCarritoIndex = carrito.findIndex(producto => producto && producto.id === item.id);

    if (productoEnCarritoIndex !== -1) {
        // Si el artículo ya está en el carrito, actualizar la cantidad
        carrito[productoEnCarritoIndex].cantidad = (carrito[productoEnCarritoIndex].cantidad || 0) + (item.cantidad || 1);
    } else {
        // Si el artículo no está en el carrito, agregarlo
        const nuevoProducto = {
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            imagen: item.imagen,
            cantidad: item.cantidad || 1,  // Asegurarse de tener una cantidad válida
        };
        carrito.push(nuevoProducto);
    }

    // Filtrar el carrito para eliminar elementos nulos o indefinidos
    carrito = carrito.filter(producto => producto && producto.id);

    // Guardar el carrito actualizado en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar el contador del carrito en la interfaz
    actualizaContCarrito();
}





function actualizarTotalEnPantalla() {
    const totalLabel = document.getElementById('totalLabel');
    if (totalLabel) {
        totalLabel.textContent = `CLP ${calcularTotal()}`;
    }
}
function asignarEventosVolverTienda() {
    const volverTiendaLink = document.getElementById('volver_btn');

    if (volverTiendaLink) {
        volverTiendaLink.addEventListener('click', function (event) {
            event.preventDefault();
            const carritoSection = document.getElementById('carritoContainer');
            if (carritoSection) {
                carritoSection.style.display = 'none';
            }
        });
    }
    
}
async function asignarEventoEliminarProducto() {
    const enlacesEliminar = document.querySelectorAll('.eliminar-producto');

    if (enlacesEliminar.length > 0) {
        enlacesEliminar.forEach(enlace => {
            enlace.addEventListener('click', async function (event) {
                event.preventDefault();
                const idProducto = this.getAttribute('data-id');

                // Eliminar el producto directamente dentro del manejador de eventos
                // Obtener el carrito actual del localStorage (si existe)
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                // Filtrar el producto a eliminar
                carrito = carrito.filter(producto => producto.id !== idProducto);

                // Console.log para verificar el carrito actualizado después de la eliminación
                console.log('Carrito actualizado después de la eliminación:', carrito);

                // Guardar el carrito actualizado en el localStorage
                localStorage.setItem('carrito', JSON.stringify(carrito));

                // Actualizar el contador del carrito en la interfaz
                actualizaContCarrito();


                // Volver a generar el contenido del carrito después de la eliminación
                const carritoContainer = document.getElementById('carritoContainer');
                if (carritoContainer) {
                    const contenidoCarritoHTML = await generarContenidoCarrito();
                    carritoContainer.innerHTML = contenidoCarritoHTML;
                    // Volver a asignar eventos después de regenerar el contenido
                    asignarEventoEliminarProducto();
                    asignarEventosVolverTienda();

                    // Agregar de nuevo los manejadores de eventos a los botones de suma y resta
                    document.querySelectorAll('.resta-btn').forEach(button => {
                        button.addEventListener('click', function () {
                            updateCantidad(this, -1, function () {
                                actualizaContCarrito();
                                actualizarTotalEnPantalla();
                            });
                        });
                    });

                    document.querySelectorAll('.suma-btn').forEach(button => {
                        button.addEventListener('click', function () {
                            updateCantidad(this, 1, function () {
                                actualizaContCarrito();
                                actualizarTotalEnPantalla();
                            });
                        });
                    });
                }
            });
        });
    } else {
        console.log("No se encontró la clase");
        const carritoContainer = document.getElementById('carritoContainer');
        if (carritoContainer) {
            carritoContainer.style.display = 'none';}
    }
}




function actualizaContCarrito() {
    // Obtener el carrito actual del localStorage (si existe)
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Sumar las cantidades de todos los elementos en el carrito
    const totalCantidades = carrito.reduce((total, detalleProducto) => total + (detalleProducto ? detalleProducto.cantidad : 0), 0);

    // Mostrar la suma en la etiqueta contador-carrito
    document.getElementById('contador-carrito').textContent = totalCantidades;
}




async function generarContenidoCarrito() {
    const volverTiendaLink = document.getElementById('volver_btn');

    function obtenerStockDisponible(idProducto) {
        return new Promise((resolve, reject) => {
            fetch(`/detalle_producto/${idProducto}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(producto => resolve(producto.cantidad))
                .catch(error => {
                    console.error('Error al obtener el stock del producto:', error);
                    resolve(0); // Otra acción en caso de error
                });
        });
    }

    if (volverTiendaLink) {
        volverTiendaLink.addEventListener('click', function(event) {
            event.preventDefault();
            const carritoSection = document.getElementById('carritoContainer');
            if (carritoSection) {
                carritoSection.style.display = 'none';
            }
        });
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(detalleProducto => detalleProducto);
    const carritoContainer = document.getElementById('carritoContainer');

    if (carrito.length === 0) {
        if (carritoContainer){
            carritoContainer.style.display = "none";
        }
    }


    // Mappear las promesas y utilizar Promise.all para esperar a que todas se resuelvan
    const contenidoElementosPromises = carrito.map(detalleProducto =>
        obtenerStockDisponible(detalleProducto.id)
            .then(stockValue => {
                const displaySumaBtn = detalleProducto.cantidad === stockValue ? 'none' : 'inline-block';
                const displayRestaBtn = detalleProducto.cantidad === 1 ? 'none' : 'inline-block';
                return `
                <div class="row mb-4 d-flex justify-content-between align-items-center">
                    <div class="col-md-2 col-lg-2 col-xl-2">
                        <img src="${detalleProducto.imagen}" class="img-fluid rounded-3" alt="Product Image">
                    </div>
                    <div class="col-md-3 col-lg-3 col-xl-3">
                        <h6 class="text-black mb-0">${detalleProducto.nombre}</h6>
                    </div>
                    <div class="col-md-3 col-lg-3 col-xl-2 d-flex">
                        <button class="btn btn-link px-2 custom-btn resta-btn" data-id="${detalleProducto.id}"style="display: ${displayRestaBtn};">
                            <img src="appDjango/static/assets/imagenes/resta.png" alt="Minus Icon">
                        </button>
                        <input min="1" disabled name="quantity" value="${detalleProducto.cantidad}" data-id="${detalleProducto.id}" type="number" class="form-control form-control-sm" />
                        <button class="btn btn-link px-2 custom-btn suma-btn" data-id="${detalleProducto.id}" style="display: ${displaySumaBtn};">
                            <img src="appDjango/static/assets/imagenes/suma.png" alt="Plus Icon" style="width: 10px; height: 10px;">
                        </button>
                    </div>
                    <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                        <h6 class="mb-0">CLP ${detalleProducto.precio} c/u</h6>
                    </div>
                    <div class="col-md-1 col-lg-1 col-xl-1 text-end">
                        <a href="#!" class="text-muted eliminar-producto" data-id="${detalleProducto.id}">
                        <img src="appDjango/static/assets/imagenes/eliminar.png" alt="Delete Icon">
                        </a>
                    </div>
                </div>
                <hr class="my-4">
            `;
            })
    );

    return Promise.all(contenidoElementosPromises)
        .then(contenidoElementos => {
            // Encapsular todo el contenido generado en la estructura del carrito
            return `
                <section class="h-100 h-custom" style="background-color: #d2c9ff;">
                    <div class="container py-5 h-100">
                        <div class="row d-flex justify-content-center align-items-center h-100">
                            <div class="col-12">
                                <div class="card card-registration card-registration-2" style="border-radius: 15px; overflow-y: auto; max-height: 80vh;">
                                    <div class="card-body p-0">
                                        <div class="row g-0">
                                            <div class="col-lg-8">
                                                <div class="p-5">
                                                    <div class="d-flex justify-content-between align-items-center mb-5">
                                                        <h1 class="fw-bold mb-0 text-black">Carrito de compras</h1>
                                                        <h6 class="mb-0 text-muted">${carrito.length} items</h6>
                                                    </div>
                                                    <hr class="my-4">

                                                    ${contenidoElementos.join('')}

                                                    <div class="pt-5">
                                                        <h6 class="mb-0"><a id="volver_btn" href="#!" class="text-body"><i class="fas fa-long-arrow-alt-left me-2"></i>Volver a la tienda</a></h6>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-lg-4 bg-grey">
                                                <div class="p-5">
                                                    <h3 class="fw-bold mb-5 mt-2 pt-1">Suma</h3>
                                                    <hr class="my-4">
                                                    <div class="d-flex justify-content-between mb-4">
                                                        <h5 class="text-uppercase">Total</h5>
                                                        <h5 id="totalLabel">CLP ${calcularTotal()}</h5>
                                                    </div>
                                                    <button type="button" class="btn btn-dark btn-block btn-lg" data-mdb-ripple-color="dark">Comprar artículos</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
        })
        .catch(error => console.error('Error al obtener el stock:', error));
}


// Función para calcular el total
function calcularTotal() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Calcular el total
    const total = Math.floor(carrito.reduce((total, detalleProducto) => total + (detalleProducto ? detalleProducto.precio * detalleProducto.cantidad : 0), 0));

    // Almacenar el total en localStorage
    localStorage.setItem('totalCompra', total.toString());

    // Devolver el total
    return total;
}















