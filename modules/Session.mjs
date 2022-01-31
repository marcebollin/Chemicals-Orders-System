import { DOM } from './DOM.mjs'
import { Order } from './Order.mjs'
import { OrderList } from './OrderList.mjs'

export class Session {
   constructor() {
      this.productsURL = 'https://raw.githubusercontent.com/corpchemicals/products-list/main/products.json' 
      this.sendPhone = '+584244044072'
      this.#setClientExistence()
      this.#init()
      this.order = new Order()
      this.orderList = new OrderList()
   }
      
   async #init() {
      try {
         const products = await this.#getProductsFromURL()
         this.#setSelects(products)
         this.#setAddButton(products)
         this.#setSubmitButton()
      } catch(err) {
         swal('Ocurrió un error')
      }
   }

   async #getProductsFromURL() {
      const response = await fetch(this.productsURL)
      return response.json()
   }

   #setClientExistence() {
      const checkClientExistence = DOM.get("#toggle-client-existence")
      const newClientFields = document.querySelectorAll(".new-client-field")
      
      checkClientExistence.addEventListener("change", ({target}) => {
          const container = target.parentElement
          container.classList.toggle("off-color")
          container.classList.toggle("on-color")
      
          newClientFields.forEach(field => {
               const inputs = field.querySelectorAll("input")
               
               inputs.forEach(input => {
                   const wasntRemoved = input.hasAttribute("required")
                   if(wasntRemoved) input.removeAttribute("required")
                   else input.required = true
               })
      
               field.classList.toggle("displayNone")
          })
      })
   }

   #setSelects(products) {
         const categorySelect = DOM.get("select#category")
         const fromNumberSelect = DOM.get("select#from-number")
         const toNumberSelect = DOM.get("select#to-number")

         //fill categorySelect
         this.#fillSelects({
             select: categorySelect, 
             data: products, 
             isCategory: true
         })

         //Event listener when category is changing
         categorySelect.addEventListener("change", ({target}) => {
             DOM.removeAllChilds(fromNumberSelect)
             DOM.removeAllChilds(toNumberSelect)

             const category = target.value

             this.#fillSelects({
                  select: fromNumberSelect, 
                  data: products[category]
             })

             this.#fillSelects({
                  select: toNumberSelect, 
                  data: products[category]
             })
         })

         //Event listener when fromNumber is changing
         fromNumberSelect.addEventListener("change", ({target}) => {
             DOM.removeAllChilds(toNumberSelect)

             const category = categorySelect.value
             const fromNumber = +target.value
             const productsRemaining = products[category].slice(fromNumber)

             this.#fillSelects({
                  select: toNumberSelect, 
                  data: productsRemaining, 
                  index: fromNumber
             })

             toNumberSelect.value = fromNumber
         })
   }

   #fillSelects({select, data, isCategory = false, index = 0}) {
         const selectOptions = []
         
         if(isCategory) {
             for(const category in data) {
                  const option = DOM.createOption(category, category.toUpperCase())
                  selectOptions.push(option)
             } 
         } else {
             for(const { number, name } of data) {
                  const option = DOM.createOption(index, `${number}: ${name}`)
                  selectOptions.push(option)
                  index++
             }
         }

         select.append(...selectOptions)
   }

   #setAddButton(products) {
      DOM.get("button#add-order").addEventListener("click", () => {
         const amount = Number(DOM.get("input#amount").value)
         if(amount <= 0) return;
         
         const category = DOM.get("select#category").value
         const from = Number(DOM.get("select#from-number").value)
         const to = Number(DOM.get("select#to-number").value)
         
         const currentOrder = products[category].slice(from, to + 1)
         this.order.addProducts(currentOrder, amount)
      })
   }

   #setSubmitButton() {
      DOM.get("#send-order-form").addEventListener("submit", (ev) => {
         ev.preventDefault()
         const seller = DOM.get("#seller").value
         const clientData = {
            name: DOM.get("#client-name").value,
            phone: DOM.get("#client-phone").value,
            identification: DOM.get("#client-identification").value,
            address: DOM.get("#client-address").value,
         }
   
         this.order.setClientData(clientData)
         this.orderList.addOrder(this.order, seller)
         this.order.clean()
      }) 
   }
}