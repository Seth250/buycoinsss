"use strict";

const endpoint = 'https://api.github.com/graphql';
const accessToken = '';
const headers = {
    Authorization: `Bearer ${accessToken}`
}
const query = `
{
    viewer{
        login,
        name,
        avatarUrl,
        bio,
        repositories(first: 20, privacy:PUBLIC, orderBy:{field:PUSHED_AT, direction:DESC}){
            totalCount,
            nodes{
                name,
                pushedAt,
                primaryLanguage{
                    name
                },
            }
        }
    },
}`
const avatarImageElements = document.querySelectorAll('.avatar-user');
const fullname = document.querySelector('.vcard-fullname');
const usernameElements = document.querySelectorAll('.u-name');
const bioContainer = document.querySelector('.user-profile-bio');
const repoList = document.querySelector('.repo-list ul');
const repoCountContainer = document.getElementById('repoCountContainer');

async function getUserDetails(){
    try{
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({query})
        })
        const { data } = await response.json();
        if (!data) {
            throw new Error("Error in query");
        }
        updateUserInfo(data);
    } catch(err) {
        console.error(err);
    }
}

function updateUserInfo({ viewer }){
    const { followers, avatarUrl, login, name, bio, repositories } = viewer;
    avatarImageElements.forEach((image) => {
        image.setAttribute('src', avatarUrl);
        if (!image.getAttribute('alt')){
            image.setAttribute('alt', `@${login}`);
        }
    });
    fullname.textContent = name; // set fullname
    usernameElements.forEach((elem) => { elem.textContent = login }); // set username in all required places
    bioContainer.appendChild(createBio(bio)); // set bio
    repoCountContainer.appendChild(createRepoCount(repositories.totalCount)); // set repos number
    repositories.nodes.forEach((repoData) => addRepoListItem(repoData)) // add repos
}

function createBio(bio){
    const docFrag = document.createDocumentFragment();
    const span = document.createElement('span');
    span.appendChild(document.createTextNode(bio));
    docFrag.appendChild(span);
    return docFrag;
}

function createRepoCount(count){
    const docFrag = document.createDocumentFragment();
    const span = document.createElement('span');
    span.setAttribute('title', count);
    span.classList.add('counter');
    span.appendChild(document.createTextNode(count));
    docFrag.appendChild(span);
    return docFrag;
}

function getRepoDateValue(dateValue){
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const now = new Date();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();
    const date = new Date(dateValue);
    const dateMonth = date.getMonth()
    const dateYear = date.getFullYear();
    console.log(nowMonth, dateMonth);
    console.log(dateYear, nowYear);

    if ((nowMonth === dateMonth) && (nowYear === dateYear)){


    } else {
        let val = `on ${months[dateMonth]} ${date.getDate()}`;
        if (dateYear !== nowYear) val += `, ${dateYear}`;
        return val;
    }
}

function addRepoListItem(data){
    console.log(data);
    const starValue = data.viewerHasStarred ? 'Unstar' : 'Star';
    const lang = data.primaryLanguage;
    const lastCommit = getRepoDateValue(data.pushedAt);
    let pryLangValue = '';
    if (lang) {
        const langName = lang.name;
        pryLangValue = `
        <span class="repo-language-container">
            <span class="repo-language-color ${langName}"></span>
            <span class="repo-language-name">${langName}</span>
        </span>
        `   
    }
    
    const docFrag = document.createDocumentFragment();
    const listItem = document.createElement('li');
    listItem.classList.add('repo-list__item');
    listItem.innerHTML = `
    <div class="repo-list__item__col-1">
        <div>
            <h3>
                <a href="#">${data.name}</a>
            </h3>
        </div>
        <div>
            ${pryLangValue}
            Updated
            <span class="repo-updated-date">${lastCommit}</span>
        </div>
    </div>
    <div class="repo-list__item__col-2">
        <form action="#">
            <button class="vcard-btn" type="submit" value="Star">
            <svg class="octicon-text-top" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
            </svg>
            ${starValue}
            </button>
        </form>
    </div>`
    docFrag.appendChild(listItem);

    // adding the repo item to the page
    repoList.appendChild(docFrag);
}

function initialize(){
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('menu');
    hamburger.addEventListener('click', () => menu.classList.toggle('item-collapse-mobile'), false);
    getUserDetails();
}

window.addEventListener('load', initialize, false);
