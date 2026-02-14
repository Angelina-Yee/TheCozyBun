const LS_KEY="cozybun_cart";

const MENU={
    ovenkisses:[
        {id:"kumo-choux", name: "Kumo Choux", desc: "Light choux pastry filled with smooth vanilla cream"},
        {id:"yukinohana", name: "Yuki no Hana", desc: "Soft, fluffy sponge cake with fresh cream filling"},
        {id:"koganetart", name: "Kogane Tart", desc: "Flaky pastry with rich, caramelized egg custard"},
    ],
    softtouches: [
        {id: "milkypurin", name: "Milky Purin", desc: "Silky smooth, lightly sweet classic Japanese dessert"},
        {id: "toffeepurin", name: "Toffee Purin", desc: "Moist date cake, topped with luscious toffee sauce"},
        {id: "strawberrysago", name: "Strawberry Sago", desc: "Refreshing strawberry milk with tender sago pearls"},
    ],
};

const NAME_BY_ID = Object.fromEntries(
    Object.values(MENU).flat().map(x => [x.id, x.name])
);

function loadCart(){
    try{
        return JSON.parse(localStorage.getItem(LS_KEY)) || {};
    } catch{
        return {};
    }
}

function saveCart(cart){
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
}

function cartCount(cart){
    return Object.values(cart).reduce((a, b) => a + b, 0);
}

function setBadge(cart){
    document.getElementById("cartCount").textContent = String(cartCount(cart));
}

function makeItemCard(item, cart){
    const div=document.createElement("div");
    div.className="item";

    const title=document.createElement("h3");
    title.textContent = item.name;

    const p=document.createElement("p");
    p.textContent= item.desc;

    const qty = document.createElement("div");
    qty.className= "qty";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "-";

    const count = document.createElement("span");
    count.textContent = String(cart[item.id] || 0);

    const plus = document.createElement("button");
    plus.type="button";
    plus.textContent="+";

    minus.addEventListener("click", () => {
        const cur = cart[item.id] || 0;
        const next = Math.max(0, cur - 1);
        if (next === 0 ) delete cart[item.id];
        else cart[item.id] = next; 

        count.textContent= String(next);
        saveCart(cart);
        setBadge(cart);
    });
    plus.addEventListener("click", () => {
        const cur = cart[item.id] || 0;
        const next = cur+1;
        cart[item.id] = next;

        count.textContent= String(next);
        saveCart(cart);
        setBadge(cart);
    });

    qty.append(minus, count, plus);
    div.append(title, p, qty);
    return div;
}

const backdrop = () => document.getElementById("backdrop");
const cartItemsEl = () => document.getElementById("cartItems");

function openModal(){
    renderCartModal();
    backdrop()?.classList.add("open");
}

function closeModal(){
    backdrop()?.classList.remove("open");
}

function formatSummary(cart){
    const entries = Object.entries(cart);
    if(entries.length===0) return "No items selected.";
    return entries.map(([id, qty]) => `${NAME_BY_ID[id] || id} x ${qty}`).join("\n");
}

function renderCartModal(){
    const el = cartItemsEl();
    if(!el) return;
    const cart = loadCart();
    const entries = Object.entries(cart);
    if(entries.length===0){
        el.innerHTML= `<div class="small">Your cart is empty.</div>`;
        return;
    }
    el.innerHTML = entries.map(([id, qty]) => {
        const name= NAME_BY_ID[id] || id;
        return `
            <div class="order-row">
                <div>
                    <div style="font-weight:800;">${name}</div>
                    <div class="small">${id}</div>
                </div>
                <div style="font-weight: 900;">x ${qty}</div>
            </div>
        `;
    }).join("");
}

function render(){
    const cart = loadCart();
    setBadge(cart);

    const oven = document.getElementById("ovenkisses");
    const soft = document.getElementById("softtouches");

    oven.innerHTML = "";
    soft.innerHTML = "";

    MENU.ovenkisses.forEach((it) => oven.appendChild(makeItemCard(it, cart)));
    MENU.softtouches.forEach((it) => soft.appendChild(makeItemCard(it, cart)));
}

document.addEventListener("DOMContentLoaded", () => {
    render();

    document.getElementById("goCart")?.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
    });

    document.getElementById("closeCart")?.addEventListener("click", closeModal);

    backdrop()?.addEventListener("click", (e) => {
        if (e.target === backdrop()) closeModal();
    });

    document.getElementById("confirmOrder")?.addEventListener("click", submitOrder);
})