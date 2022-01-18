const urlParams = new URLSearchParams(window.location.search);
const page = +(urlParams.get('page')) + 1;

const table = document.querySelector('.table tbody');
const pagination = document.querySelector('.pagination');

let data = window.data.slice(page * 10, page * 10 + 10);

console.log(data);


const sortDataByElementClassname = (data, th) => {
    const sortReturns = th.classList.contains('asc') ? 1 : -1;

    if (th.classList.contains('first-name')) {
        data = data.sort((a, b) => {
            if (a.name.firstName > b.name.firstName) return sortReturns;
            if (a.name.firstName < b.name.firstName) return -sortReturns;
            return 0;
        });
    } else if (th.classList.contains('last-name')) {
        data = data.sort((a, b) => {
            if (a.name.lastName > b.name.lastName) return sortReturns;
            if (a.name.lastName < b.name.lastName) return -sortReturns;
            return 0;
        });
    } else if (th.classList.contains('about')) {
        data = data.sort((a, b) => {
            if (a.about > b.about) return sortReturns;
            if (a.about < b.about) return -sortReturns;
            return 0;
        });
    } else if (th.classList.contains('eye-color')) {
        data = data.sort((a, b) => {
            if (a.eyeColor > b.eyeColor) return sortReturns;
            if (a.eyeColor < b.eyeColor) return -sortReturns;
            return 0;
        });
    }

    return data;
};

const createTableData = data => {
    const fragment = document.createDocumentFragment();

    for (let row of data) {
        const tr = document.createElement('tr');
        const fields = [
            ['first-name', row.name.firstName],
            ['last-name', row.name.lastName],
            ['about', row.about],
            ['eye-color', row.eyeColor],
        ];

        for (let [className, content] of fields) {
            let td = document.createElement('td');
            td.className = className;
            if (className === 'eye-color') {
                td.style.backgroundColor = content;
                td.color = content;
            } else {
                let div = document.createElement('div');
                div.textContent = content;
                td.append(div);
            }
            tr.appendChild(td);
        }
        fragment.appendChild(tr);
    }
    return fragment;
};


const createPages = () => {
    const fragment = document.createDocumentFragment();
    const pages = Array(window.data.length / 10).keys();

    for (let page of pages) {
        // const span = createElement('button', {
        //     className: 'container__pagination_btn',
            // textContent: `${page + 1}`,
        //     dataset: {
        //         i: `${page + 1}`
        //     },
        // });
        const el = document.createElement('button');
        el.className = 'pagination_btn';
        el.textContent = `${page + 1}`;
        el.id = `${page + 1}`;
        fragment.append(el);
    }

    return fragment;
};


const fillTable = data => {
    table.innerHTML = '';
    const rows = createTableData(data);
    console.log(rows);
    table.append(rows);
    console.log(table);
};

const fillPagination = () => {
    const pages = createPages();
    pagination.append(pages);
};


fillTable(data);
fillPagination(page);

document.querySelector('.table thead')
    .addEventListener('click', evt => {
        console.log('dfsf');
        const el = evt.target.closest('.sort');
        if (!el) return;
        // switchTriangleFor(el);
        data = sortDataByElementClassname(data, el);
        fillTable(data);
});


document.querySelector('.pagination')
        .addEventListener('click', evt => {
            const el = evt.target;
            let page = el.id;
            console.log(page);
            location.href = window.location.href.split('?')[0] + `?page=${page}`;
        });