let articulos = [];

const navRopa = document.querySelectorAll(".nav-ropa");
const container = document.querySelector(".Productos");
const verprodCarrito = document.getElementById("verprodCarrito");
const verTotal = document.getElementById("total");
const vaciarCarrito = document.getElementById("vaciarcarrito");
const contadorCarrito = document.querySelector(".cart-count");

let contadorarticulos = JSON.parse(localStorage.getItem("Contador")) || 0;
let carritoAcumulado = JSON.parse(localStorage.getItem("Item")) || [];
let total = JSON.parse(localStorage.getItem("Total")) || 0;
let cantidad = 1;

// Cuando inicio la pagina o hago refresh

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./JSON/articulos.json");
    const data = await res.json();
    articulos = data;
    displayArticulos(articulos);
    carritoInicio(carritoAcumulado);
    mostrarcantArticulos();
    mostrarTotal();
  } catch (error) {
    console.error("Error:", error);
  }
});

// Me muestra los articulos en la pantalla incial

function displayArticulos(articulosItem) {
  let displayArticulos = articulosItem
    .map(function (item) {
      return `<div id="Producto1">
        <img src="${item.imagen}" alt="" class="fotoproducto" />
        <br />
        <a href="#" class="texto-productos">${item.nombre.toUpperCase()}</a>
        <h2 class="precio">$${item.precio}</h2>
        <br />
        <a href="#" style="text-decoration: none" class="linkagregarcarrito" id=${
          item.id
        }>AGREGAR AL CARRITO</a>
      </div>`;
    })
    .join("");
  container.innerHTML = displayArticulos;
}

// Filtro  para cuando selecciono zapatos,camisas,rtc... me lo toma por el id
navRopa.forEach((navRopa) => {
  navRopa.addEventListener("click", (e) => {
    e.preventDefault();
    const filtro = e.currentTarget.dataset.id;
    const categorias = articulos.filter(function (articulosItem) {
      if (articulosItem.categoria === filtro) {
        return articulosItem;
      }
    });
    filtro === "Todos"
      ? displayArticulos(articulos)
      : displayArticulos(categorias);
  });
});

// Evento para que cuando haga click en el boton de agregar carrito me inserte los elementos en mi HTML  que se van agregando a mi carrito.

container.addEventListener("click", (e) => {
  if (e.target.classList.contains("linkagregarcarrito")) {
    e.preventDefault();
    let idLinkcarrito = parseInt(e.target.id);
    let coincidencia = carritoAcumulado.some(function (item) {
      return item.id === idLinkcarrito;
    });
    if (!coincidencia) {
      let prodAgregado = articulos.filter(function (item) {
        return item.id === idLinkcarrito;
      });
      const nuevaPropAgregada = [{ ...prodAgregado[0], cantidad }];
      carritoInicio(nuevaPropAgregada);
      const objeto = { ...nuevaPropAgregada[0] };
      acumuladorPrecioCont(objeto.precio, 1);
      carritoAcumulado.push(objeto);
      localStorage.setItem("Item", JSON.stringify(carritoAcumulado));
      localStorage.setItem("Contador", JSON.stringify(contadorarticulos));
      mostrarcantArticulos();
      mostrarAgregadoArticulo();
    } else {
      const posición = carritoAcumulado.findIndex(
        (item) => item.id === idLinkcarrito
      );
      let precioOrig =
        carritoAcumulado[posición].precio / carritoAcumulado[posición].cantidad;
      let precioItem = (carritoAcumulado[posición].precio += precioOrig);
      let cantidadItem = carritoAcumulado[posición].cantidad + 1;
      carritoAcumulado[posición].precio = precioItem;
      carritoAcumulado[posición].cantidad = cantidadItem;
      localStorage.setItem("Item", JSON.stringify(carritoAcumulado));
      const elementoprecio = document.getElementsByClassName(
        `precio${idLinkcarrito}`
      );
      const primerElementoPrecio = elementoprecio[0];
      primerElementoPrecio.textContent = "$" + precioItem;
      const elementocantidad = document.getElementsByClassName(
        `cantidad${idLinkcarrito}`
      );
      const primerElementoCantidad = elementocantidad[0];
      primerElementoCantidad.textContent = cantidadItem;
      total += precioOrig;
      localStorage.setItem("Total", JSON.stringify(total));
      mostrarTotal();
      contadorarticulos++;
      localStorage.setItem("Contador", JSON.stringify(contadorarticulos));
      mostrarcantArticulos();
      mostrarAgregadoArticulo();
    }
  }
});

function acumuladorPrecioCont(precio, contador) {
  total += precio;
  localStorage.setItem("Total", JSON.stringify(total));
  contadorarticulos += contador;
  mostrarTotal();
}

function carritoInicio(values) {
  values.forEach((valor) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("itemAgregado");
    productDiv.innerHTML = `<h4 class="productoagregado">
    <div id= "sumaresta">
    <button style="cursor:pointer" class="restar" id=${valor.id}>-</button>
    <h5 class="cantidad${valor.id}">${valor.cantidad}</h5>
    <button style="cursor:pointer" class="sumar" id=${valor.id}>+</button>
    </div>
    <img src="${valor.imagen}" alt="" class="fotocarrito" />
    <span class="contador">${valor.contadorarticulos}</span>
    <span class="nombreitem">${valor.nombre}</span>
    <span class="precio${valor.id}">$${valor.precio}</span>
    <span class="botonx"><button style="cursor:pointer" class="cerrar" id=${valor.id}>X</button></span>
  </h4>`;
    verprodCarrito.appendChild(productDiv);
  });
}

//Evento que me permite vaciar el carrito borrando todo lo que tengo en localstorage almacenado.
vaciarCarrito.addEventListener("click", (e) => {
  e.preventDefault();
  Swal.fire({
    title: "Vaciado de Carrito",
    text: "¿Está seguro que desea vaciar su carrito?",
    icon: "warning",
    iconColor: "#f5edf1",
    position: "center",
    showCancelButton: true,
    confirmButtonColor: "grey",
    cancelButtonColor: "grey",
    confirmButtonText: "Vaciar",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        position: "center",
        icon: "success",
        iconColor: "#f5edf1",
        title: "Su carrito fue vaciado",
        showConfirmButton: false,
        timer: 800,
      });
      window.localStorage.clear();
      quitarElementos(".itemAgregado");
      mostrarTotal();
      mostrarcantArticulos();
    }
  });
});

//FUNCION QUE ME PERMITE BORRAR LOS ELEMENTOS QUE FUERON AGREGADOS AL CARRITO Y VOLVER LOS VALORES A SU VALOR INICIAL.

function quitarElementos(elemento) {
  let elementos = document.querySelectorAll(elemento);
  elementos.forEach(function (elemento) {
    elemento.remove();
    carritoAcumulado = [];
    total = 0;
    contadorarticulos = 0;
    cantidad = 1;
  });
}

//Evento para borrar items especificos de mi carrito de compras con el boton X

function mostrarTotal() {
  verTotal.innerHTML = `<h4>Total: $${total}</h4>`;
}

function mostrarcantArticulos() {
  contadorCarrito.textContent = `${contadorarticulos}`;
}

// Evento que me permite sumar cantidad del item agregado a mi carrito, me resta la cantidad y el precio
verprodCarrito.addEventListener("click", (e) => {
  if (e.target.classList.contains("sumar")) {
    let idLinksumar = parseInt(e.target.id);
    const posición = carritoAcumulado.findIndex(
      (item) => item.id === idLinksumar
    );
    const itemIndividual = carritoAcumulado[posición];
    const precioOrig = articulos.find(function (item) {
      return item.id === idLinksumar;
    });
    sumaPrecioCantidad(precioOrig, itemIndividual);
    localStorage.setItem("Total", JSON.stringify(total));
    mostrarTotal();
    carritoAcumulado[posición] = itemIndividual;
    contadorarticulos++;
    localStorage.setItem("Contador", JSON.stringify(contadorarticulos));
    mostrarcantArticulos();
    localStorage.setItem("Item", JSON.stringify(carritoAcumulado));
  }

  function sumaPrecioCantidad(precioOrig, itemIndividual) {
    let precio1 = precioOrig.precio;
    let nuevaCantidad = itemIndividual.cantidad + 1;
    nuevaCantidad = nuevaCantidad <= 0 ? 0 : nuevaCantidad;
    let nuevoPrecio = precio1 * nuevaCantidad;
    itemIndividual.precio = nuevoPrecio;
    precio1 = itemIndividual.cantidad < 0 ? 0 : precio1;
    total = total + precio1;
    itemIndividual.cantidad = nuevaCantidad;
    e.target.previousElementSibling.innerText = nuevaCantidad;
    e.target.parentElement.parentElement.lastChild.previousElementSibling.previousElementSibling.innerText = `$${nuevoPrecio}`;
  }
});

// Evento que me permite restar cantidad del item agregado a mi carrito, me resta la cantidad y el precio en el localstorage

verprodCarrito.addEventListener("click", (e) => {
  if (e.target.classList.contains("restar")) {
    let idLinksumar = parseInt(e.target.id);
    const posición = carritoAcumulado.findIndex(
      (item) => item.id === idLinksumar
    );
    const itemIndividual = carritoAcumulado[posición];
    const precioOrig = articulos.find(function (item) {
      return item.id === idLinksumar;
    });
    restaPrecioCantidad(precioOrig, itemIndividual);
    localStorage.setItem("Total", JSON.stringify(total));
    mostrarTotal();
    if (itemIndividual.cantidad === 0) {
      carritoAcumulado.splice(posición, 1);
      e.target.parentElement.parentElement.parentElement.remove();
      localStorage.setItem("Item", JSON.stringify(carritoAcumulado));
      contadorarticulos--;
      localStorage.setItem("Contador", JSON.stringify(contadorarticulos));
      mostrarcantArticulos();
      mostrarTotal();
      mostrarEliminarArticulo();
    } else {
      carritoAcumulado[posición] = itemIndividual;
      localStorage.setItem("Item", JSON.stringify(carritoAcumulado));
      contadorarticulos--;
      localStorage.setItem("Contador", JSON.stringify(contadorarticulos));
      mostrarcantArticulos();
    }
  }
  function restaPrecioCantidad(precioOrig, itemIndividual) {
    let precio1 = precioOrig.precio;
    let nuevaCantidad = itemIndividual.cantidad - 1;
    nuevaCantidad = nuevaCantidad < 0 ? 0 : nuevaCantidad;
    let nuevoPrecio = precio1 * nuevaCantidad;
    itemIndividual.precio = nuevoPrecio;
    precio1 = itemIndividual.cantidad <= 0 ? 0 : precio1;
    total = total - precio1;
    itemIndividual.cantidad = nuevaCantidad;
    e.target.nextElementSibling.innerText = nuevaCantidad;
    e.target.parentElement.parentElement.lastChild.previousElementSibling.previousElementSibling.innerText = `$${nuevoPrecio}`;
    return nuevaCantidad;
  }
});

// Evento que al apretar la X me elimina el carrito del HTML y del localstorage

verprodCarrito.addEventListener("click", (e) => {
  if (e.target.classList.contains("cerrar")) {
    e.preventDefault();
    let idLinkcarrito = parseInt(e.target.id);
    let precioEliminado = carritoAcumulado.filter(function (item) {
      return item.id === idLinkcarrito;
    });
    let nuevoCarrito = carritoAcumulado.filter(function (item) {
      return item.id !== idLinkcarrito;
    });
    let contadorItem = precioEliminado[0].cantidad;
    let precio = precioEliminado[0].precio;
    let nuevoContador = contadorarticulos - contadorItem;
    contadorarticulos = nuevoContador;
    carritoAcumulado = nuevoCarrito;
    localStorage.setItem("Contador", JSON.stringify(contadorarticulos));
    mostrarcantArticulos();
    localStorage.setItem("Item", JSON.stringify(carritoAcumulado));
    total = total - precio;
    localStorage.setItem("Total", JSON.stringify(total));
    mostrarTotal();
    e.target.parentElement.parentElement.parentElement.remove();
    mostrarEliminarArticulo();
  }
});

// Pop-up cuanado elimino un articulo de mi carrito.

function mostrarEliminarArticulo() {
  Toastify({
    text: "Se ha eliminado el artículo",
    style: {
      background: "linear-gradient(to right,  black, black )",
      color: "white",
    },
    offset: {
      x: 20,
      y: 90,
    },
    duration: 900,
  }).showToast();
}

// Pop-up cuanado agrego un articulo de mi carrito.

function mostrarAgregadoArticulo() {
  Toastify({
    text: "Producto agregado al carrito",
    style: {
      background: "linear-gradient(to right,  black, black )",
      color: "white",
    },
    offset: {
      x: 20,
      y: 90,
    },
    duration: 900,
  }).showToast();
}
