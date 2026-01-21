const teamData = [
    {
        name: "Tom Chen",
        primaryRole: "Primary Coder",
        secondaryRole: "Secondary Data Architect",
        image: "images/tom_chen.avif",
        fallback: "images/tom_chen.jpg",
        linkedin: "https://www.linkedin.com/in/tomchen1581"
    },
    {
        name: "Jeremy Senh",
        primaryRole: "Primary Data Architect",
        secondaryRole: "Secondary Project Manager",
        image: "images/jeremy_senh.avif",
        fallback: "images/jeremy_senh.jpg",
        linkedin: "https://www.linkedin.com/in/jeremy-senh/"
    },
    {
        name: "Christopher Straface",
        primaryRole: "Primary Designer",
        secondaryRole: "Secondary Coder",
        image: "images/christopher_straface.avif",
        fallback: "images/christopher_straface.jpg",
        linkedin: "https://www.linkedin.com/in/christopher-straface-a84338276/"
    },

    {
        name: "Chloe To",
        primaryRole: "Primary Project Manager",
        secondaryRole: "Secondary Designer",
        image: "images/chloe_to.avif",
        fallback: "images/chloe_to.jpg",
        linkedin: "https://www.linkedin.com/in/chloe--to"
    }
];

function createTeamMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'team-member';

    const imageContainer = document.createElement('picture');
    imageContainer.className = 'member-image-container';

    const source = document.createElement('source');
    source.srcset = member.image;
    source.type = 'image/avif';
    source.classList.add('member-image');
    imageContainer.appendChild(source);

    const img = document.createElement('img');
    img.src = member.fallback;
    img.alt = member.name;
    img.className = 'member-image';
    imageContainer.appendChild(img);

    const info = document.createElement('div');
    info.className = 'member-info';

    const name = document.createElement('p');
    name.className = 'member-name';
    name.textContent = member.name;
    info.appendChild(name);

    const role = document.createElement('p');
    role.className = 'member-role';

    const primaryRole = document.createElement('span');
    primaryRole.className = 'role-primary';
    primaryRole.textContent = member.primaryRole;

    role.appendChild(primaryRole);
    role.appendChild(document.createElement('br'));
    role.appendChild(document.createTextNode(member.secondaryRole));

    info.appendChild(role);

    if (member.linkedin) {
        const linkedinLink = document.createElement('p');
        linkedinLink.className = 'member-link';
        linkedinLink.innerHTML = `
            View LinkedIn <span class="linkedin-icon">→</span>
        `;
        linkedinLink.onclick = () => window.open(member.linkedin, '_blank');

        info.appendChild(linkedinLink);
    }

    card.appendChild(imageContainer);
    card.appendChild(info);

    return card;
}

// Function to render all team members
function renderTeamMembers() {
    const teamGrid = document.getElementById('team-grid');

    teamData.forEach(member => {
        const card = createTeamMemberCard(member);
        teamGrid.appendChild(card);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', renderTeamMembers);
