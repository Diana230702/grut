const API = "http://localhost:8000/products";
// ? переменные для инпутов: добавление товаров
let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let image = document.querySelector("#image");
let btnAdd = document.querySelector("#btn-add");

// ? переменные для инпутов:редактирование товаров
let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImage = document.querySelector("#edit-image");
let editSaveBtn = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");

// ? блок куда добавляются карточки
let list = document.querySelector("#product-list");

// ? pagination
let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
let currentPage = 1;
let pageTotalcount = 1;

// ? search
let searchInp = document.querySelector("#search");
let searchVal = "";

btnAdd.addEventListener("click", async () => {
  // формируем объект с данными из инпута
  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };
  // проверка на заполненность
  if (
    !obj.title.trim() ||
    !obj.price.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim()
  ) {
    alert("Заполните все поля!");
    return;
  }
  //   отправляем пост запрос
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });
  //   очищаем инпуты
  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = "";
  render();
});

// ?функция для  отображения карточек продукта
async function render() {
  // получаем список продуктов с сервера
  let res = await fetch(`${API}?q=${searchVal}&_page=${currentPage}&_limit=3`);
  let products = await res.json();

  drawPaginayionButtons();
  // очищаем лист
  list.innerHTML = "";
  // перебираем массив products

  products.forEach((element) => {
    // создаем новый див

    let newElem = document.createElement("div");
    // задаем айди новому диву

    newElem.id = element.id;
    // помещаем карточку в созданный див
    newElem.innerHTML = `
    <div class="card m-5" style="width: 18rem;">
   <img src=${element.image} class="card-img-top" alt="...">
   <div class="card-body">
    <h5 class="card-title">${element.title}</h5>
    <p class="card-text">${element.descr}</p>
    <p class="card-text">${element.price}</p>

    <a href="#"  id=${element.id} class="btn btn-danger btn-delete">DELETE</a>
    <a href="#" id=${element.id} class="btn btn-warning btn-edit" data-bs-toggle="modal" data-bs-target="#exampleModal">EDIT</a>


   </div>
   </div>
    `;
    // добавляем созданный див с карточкой внутри list
    list.append(newElem);
  });
}
render();
// ? удаление продукта

// вешаем слушатель событий на весь документ
document.addEventListener("click", (e) => {
  // делаем проверку, для того чтобы отловить клик именно по элементу с классом btn-delete
  if (e.target.classList.contains("btn-delete")) {
    // вытаскиваем айди
    let id = e.target.id;
    console.log(id);
    // делаем запрос на удаление
    fetch(`${API}/${id}`, {
      method: "DELETE",
    }).then(() => render());
    // вызываем render для отображения актуальных данных
    render();
  }
});

// редактирование продукта

// отлавливаем клик по кнопке edit
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    let id = e.target.id;
    // получаем данные редактируемого продукта
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then(
        (data) => (
          // заполняем инпуты модального окна, данными, которые стянули с сервера
          (editTitle.value = data.title),
          (editPrice.value = data.price),
          (editDescr.value = data.descr),
          (editImage.value = data.image),
          // задаем id кнопке save changes
          editSaveBtn.setAttribute("id", data.id)
        )
      );
  }
});

// функция для отправки отредактированных данных на сервер

editSaveBtn.addEventListener("click", function () {
  let id = this.id;
  // вытаскиваем данные из инпута
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;
  let image = editImage.value;
  // проверка на заполненность
  if (!title || !descr || !price || !image) {
    alert("заполните поля");
    return;
  }
  // формируем объект на основе данных из инпута
  let editedProduct = {
    title: title,
    price: price,
    descr: descr,
    image: image,
  };
  // вызываем функцию для сохранения на сервере
  saveEdit(editedProduct, id);
});

function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(editedProduct),
  }).then(() => render());
  // закрываем модальное окно
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

// pagination

// функция для отрисовки кнопок пагинации
function drawPaginayionButtons(params) {
  // отправляем запрос для получения общего кол-ва продуктов
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      //рассчитываем общее кол-во страниц
      pageTotalcount = Math.ceil(data.length / 3);
      paginationList.innerHTML = ""; //очищаем
      for (let i = 1; i <= pageTotalcount; i++) {
        // создаем кнопки с цифрами и для текущей страницы задаем класс active
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = `
        <li class="page-item active"><a class="page-link page_number" href="#">${i}</a></li>
          
          `;
          paginationList.append(page1);
        } else {
          let page1 = document.createElement("li");
          page1.innerHTML = `
        <li class="page-item"><a class="page-link page_number" href="#">${i}</a></li>
          
          `;
          paginationList.append(page1);
        }
      }
      // ? красим в серый цвет prev/next кнопки
      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalcount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}
// слушатель событий для кнопку prev
prev.addEventListener("click", () => {
  // делаем проверку, на то не находимся ли мы на первой странице
  if (currentPage <= 1) {
    return;
  }
  // если не находимся на первой странице , то перезаписываем currentPage и вызываем render
  currentPage--;
  render();
});

next.addEventListener("click", () => {
  if (currentPage >= pageTotalcount) {
    return;
  }
  currentPage++;
  render();
});

document.addEventListener("click", function (e) {
  // отлавливаем клик по цифре из пагинации
  if (e.target.classList.contains("page_number")) {
    // перезаписываем currentpage на то значение, которое содержит элемент на который нажали
    currentPage = e.target.innerText;
    // вызываем render с перезаписанным currentPage
    render();
  }
});

searchInp.addEventListener("input", () => {
  searchVal = searchInp.value;
  render();
});
