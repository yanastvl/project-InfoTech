const urlParams = new URLSearchParams(window.location.search);
const page = parseInt(urlParams.get('page') || 1) - 1;
const table = document.querySelector('.table tbody');
const pagination = document.querySelector('.pagination');
const editor = document.querySelector('.editor');
const editorForm = document.querySelector('.editor__form');
const closeBtn = document.querySelector('.close');
let data = window.data.slice(page * 10, page * 10 + 10);


/**
 * Наполняет таблицу данными через создание DocumentFragment - 
 * для улучшения производительности в случае множественных вставок 
 */
const createTableData = data => {
    const fragment = document.createDocumentFragment();

    for (let row of data) {
        const tr = document.createElement('tr');
        tr.className = "data_row";
        tr.id = row.id;
        const fields = [
            ['firstName', row.name.firstName],
            ['lastName', row.name.lastName],
            ['about', row.about],
            ['eyeColor', row.eyeColor],
        ];

        for (let [className, content] of fields) {
            //если одна из ячеек была отредактирована через форму, берем данные из local storage
            const updatedRow = JSON.parse(localStorage.getItem(`${row.id}_${className}`));
            if (updatedRow && className == updatedRow.name) {content = updatedRow.value;}

            let td = document.createElement('td');
            td.className = className;
            let div = document.createElement('div');
            div.textContent = content;
            td.append(div);
            if (className === 'eyeColor') {
                td.style.backgroundColor = content;
                td.color = content;
                div.hidden = true;
            }
            tr.appendChild(td);
        }
        fragment.appendChild(tr);
    }
    return fragment;
};


/**
 * Создает кнопки для переключения между страницами
 */
const createPages = () => {
    const fragment = document.createDocumentFragment();
    const pages = Array(window.data.length / 10).keys();

    for (let page of pages) {
        const el = document.createElement('button');
        el.className = 'pagination_btn';
        el.textContent = `${page + 1}`;
        el.id = `${page + 1}`;
        fragment.append(el);
    }

    return fragment;
};


/**
 * Отрисовывает таблицу
 */
const fillTable = data => {
    const rows = createTableData(data);
    table.append(rows);
};


/**
 * Отрисовывает кнопки блока с пагинацией
 */
const fillPagination = () => {
    const pages = createPages();
    pagination.append(pages);
};


fillTable(data);
fillPagination(page);


/**
 * Перемещает на выбранный номер страницы
 */
document.querySelector('.pagination')
        .addEventListener('click', evt => {
            const el = evt.target;
            let page = el.id;
            location.href = window.location.href.split('?')[0] + `?page=${page}`;
        });


/**
 * Сортирирует ряды в таблице по выбранному столбцу
 */
document.addEventListener('DOMContentLoaded', () => {
    const getSort = ({ target }) => {
        const order = (target.dataset.order = -(target.dataset.order || -1));
        const index = [...target.parentNode.cells].indexOf(target);
        const collator = new Intl.Collator(['en', 'ru'], { numeric: true });
        const comparator = (index, order) => (a, b) => order * collator.compare(
            a.children[index].innerHTML,
            b.children[index].innerHTML
        );
        
        for(const tBody of target.closest('table').tBodies)
            tBody.append(...[...tBody.rows].sort(comparator(index, order)));

        for(const cell of target.parentNode.cells)
            cell.classList.toggle('sorted', cell === target);
    };
    
    document.querySelectorAll('.table thead').forEach(tableth => tableth.addEventListener('click', () => getSort(event)));
});


/**
 * Словарь для доступа к отображаемому на странице тексту по ключу из data.js
 */
const editorLabelMap = {
    'firstName': 'Имя',
    'lastName': 'Фамилия',
    'about': 'Описание',
    'eyeColor': 'Цвет глаз',
};


/**
 * Создает и возвращает инпут для формы редактирования
 */
const createInput = (name) => {
    if (name !== 'about') {
        const input = document.createElement('input');
        input.type = 'text';
        return input;
    }
    else {
        const input = document.createElement('textarea');
        input.rows = '4';
        return input;
    }
};


/**
 * Удаляет предыдущее поле в форме для редактирования, затем создает новое
 * и добавляет в форму
 */
const fillForm = (rowId, name, value) => {
    const lastField = document.querySelector('.editor__form_field');
    if (lastField) {lastField.remove();}
    const field = document.createElement('label');
    field.className = 'editor__form_field';
    field.textContent = `${editorLabelMap[name]}:`;
    const input = createInput(name);
    input.dataset.id = rowId;
    input.dataset.name = name;
    input.placeholder = editorLabelMap[name];
    input.value = value;
    field.append(input);
    editorForm.prepend(field);
    editorForm.classList.remove('hidden');
};


/**
 * Создает обработчик события, который при клике на ячейку таблицы передает данные в форму
 */
document.querySelector('.table tbody')
    .addEventListener('click', evt => {
        const el = evt.target.closest('td');
        const rowId = evt.target.closest('.data_row').id;
        const content = el.textContent;
        fillForm(rowId, el.className, content);
        closeBtn.classList.remove('hidden');
});


/**
 * При нажатии на 'крестик' скрывает форму
 */
closeBtn.onclick = () => {
    editorForm.classList.add('hidden');
};


/**
 * Создает обработчик события, который сохраняет данные из формы в local storage
 */
document.querySelector('.save__btn')
    .addEventListener('click', evt => {
        evt.preventDefault();
        const field = document.querySelector('.editor__form_field');
        const input = field.querySelector('input,textarea');
        const id = input.dataset.id;
        const name = input.dataset.name;
        const value = input.value;

        window.data.forEach((item, i, arr) => {
            if (item.id === id) {
                localStorage.setItem(`${id}_${name}`, JSON.stringify({"name": name, "value": value}));
            }
        });
        location.reload();
    });


/**
 * Вешает обработчики событий на кнопки, скрывающие соответствующие колонки
 */
const hideColumn = () => {
    const hiddenBtns = document.querySelectorAll('.btn-hide');
    
    hiddenBtns.forEach((item, i) => {
        const cells = document.querySelectorAll(`th:nth-child(${i+1}), td:nth-child(${i+1})`);

        item.addEventListener('click', () => {
        if (!item.classList.contains('crossed-out')) {
            item.classList.add('crossed-out');
            cells.forEach(it => it.classList.add('minimized'));
        } else {
            item.classList.remove('crossed-out');
            cells.forEach(it => it.classList.remove('minimized'));
        }
    });
});
};

hideColumn();