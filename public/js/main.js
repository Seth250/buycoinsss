
const avatarImageElements = document.querySelectorAll('.avatar-user');
const fullname = document.querySelector('.vcard-fullname');
const usernameElements = document.querySelectorAll('.u-name');
const bioContainer = document.querySelector('.user-profile-bio');
const repoList = document.querySelector('.repo-list ul');
const repoCountContainer = document.getElementById('repoCountContainer');

const endpoint = 'https://api.github.com/graphql';
const accessToken = 'e9070ea1e1e7207078657849bbd4ea8d96e11f44';
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
        email,
        twitterUsername,
        followers{
            totalCount
        },
        following{
            totalCount
        },
        starredRepositories{
            totalCount
        }
        repositories(first: 20, privacy:PUBLIC, orderBy:{field:PUSHED_AT, direction:DESC}){
            totalCount,
            nodes{
                name,
                description,
                pushedAt,
                primaryLanguage{
                    name
                },
                licenseInfo{
                    name
                },
                repositoryTopics(first: 8){
                    nodes{
                        topic{
                            name
                        }
                    }
                }
            }
        }
    },
}`

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
    const { followers, following, starredRepositories, avatarUrl, login, name, bio, email, twitterUsername, repositories } = viewer;
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
    document.getElementById('followers').textContent = followers.totalCount;
    document.getElementById('following').textContent = following.totalCount;
    document.getElementById('stars').textContent = starredRepositories.totalCount;
    document.getElementById('email').textContent = email;
    document.getElementById('twitterUsername').textContent = `@${twitterUsername}`;
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

    if ((nowMonth === dateMonth) && (nowYear === dateYear)){
        const value = (now - date) / 1000;
        if (value < 60){
           return `${value} Seconds ago`;
        } else if (value < 3600){
            return `${Math.round(value / 60)} Minutes ago`;
        } else if (value < 86400){
            return `${Math.round(value / 3600)} Hours ago`;
        } else {
            return `${Math.round(value / 86400)} Days ago`;
        }
    } else {
        let val = `on ${months[dateMonth]} ${date.getDate()}`;
        if (dateYear !== nowYear) val += `, ${dateYear}`;
        return val;
    }
}

function createPryLangElem(langName){
    return `
    <span class="repo-value-container">
        <span class="repo-language-color ${langName}"></span>
        <span class="repo-language-name">${langName}</span>
    </span>
    `
}

function createLicenseElem(licenseName){
    return `
    <span class="repo-value-container">
        <svg class="octicon-text-bottom" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M8.75.75a.75.75 0 00-1.5 0V2h-.984c-.305 0-.604.08-.869.23l-1.288.737A.25.25 0 013.984 3H1.75a.75.75 0 000 1.5h.428L.066 9.192a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.514 3.514 0 00.686.45A4.492 4.492 0 003 11c.88 0 1.556-.22 2.023-.454a3.515 3.515 0 00.686-.45l.045-.04.016-.015.006-.006.002-.002.001-.002L5.25 9.5l.53.53a.75.75 0 00.154-.838L3.822 4.5h.162c.305 0 .604-.08.869-.23l1.289-.737a.25.25 0 01.124-.033h.984V13h-2.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-2.5V3.5h.984a.25.25 0 01.124.033l1.29.736c.264.152.563.231.868.231h.162l-2.112 4.692a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.517 3.517 0 00.686.45A4.492 4.492 0 0013 11c.88 0 1.556-.22 2.023-.454a3.512 3.512 0 00.686-.45l.045-.04.01-.01.006-.005.006-.006.002-.002.001-.002-.529-.531.53.53a.75.75 0 00.154-.838L13.823 4.5h.427a.75.75 0 000-1.5h-2.234a.25.25 0 01-.124-.033l-1.29-.736A1.75 1.75 0 009.735 2H8.75V.75zM1.695 9.227c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327l-1.305 2.9zm10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327l-1.305 2.9z"></path>
        </svg>
        ${licenseName}
    </span>
    `
}

function createDescriptionElem(description){
    return `
    <div class="repo-description">
        <p>${description}</p>
    </div>
    `
}

function createTopicsElem(topicsArr){
    const container = document.createElement('div');
    container.classList.add('repo-topics-container');

    topicsArr.forEach(({ topic }) => {
        const elem = document.createElement('a');
        elem.setAttribute('href', '#');
        elem.classList.add('topics-tag-link');
        elem.appendChild(document.createTextNode(topic.name));
        container.appendChild(elem);
    })

    return container.outerHTML;
}

function addRepoListItem(data){
    const starValue = data.viewerHasStarred ? 'Unstar' : 'Star';
    const descElem = data.description ? createDescriptionElem(data.description) : '';

    const pryLang = data.primaryLanguage;
    const pryLangElem = pryLang ? createPryLangElem(pryLang.name) : '';

    const license = data.licenseInfo;
    const licenseElem = license ? createLicenseElem(license.name) : '';

    const topicsArr = data.repositoryTopics.nodes;
    const topicsElem = topicsArr.length ? createTopicsElem(topicsArr) : '';

    const lastCommit = getRepoDateValue(data.pushedAt);
    
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
        ${descElem}
        ${topicsElem}
        <div>
            ${pryLangElem}
            ${licenseElem}
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
    hamburger.addEventListener('click', () => {
        menu.classList.toggle('item-collapse-mobile');
        document.querySelector('.page-header').classList.toggle('responsive');
    }, false);
    getUserDetails();
}

window.addEventListener('load', initialize, false);
