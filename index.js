const { ls } = require('js-prototype-lib');
const jsp = require('js-prototype-lib');
const puppeteer = require('puppeteer');
const www = 'https://bank.codes'

jsp.install()

class Cache {
	fn = './cache.json'
	load(key) {
		if (this.fn.fex())
			this.assign(JSON.parse(this.fn.cat()))
		return this[key]
	}
	save() {
		this.tee(this.fn)
	}
}

var self = module.exports = {
	cache: new Cache(),
	start: async () => {
		const UserAgent = 'Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0'
		self.browser = await puppeteer.launch({headless: true});
		self.page = await self.browser.newPage();
		await self.page.setUserAgent(UserAgent)
		return self.page
	},
	stop: () => {
		self.browser.close()
	},
	get: async (url, handler) => {
		var page = self.page || await self.start()
		console.error(url)
		await page.goto(url)
		return await page.evaluate(handler)
	},
	countries: async () => {
		var key = 'countries'
		if (ret = self.cache.load(key))
			return ret

		console.error('retrieving countries...')
		self.cache[key] = await self.get(www + '/swift-code/', () => {
			var ret = {}
			var ls = document.querySelectorAll('.country li a')
			for (let o of ls) {
				ret[o.innerHTML] = o.getAttribute('href')
			}
			return ret
		})
		self.cache.save()
		return self.cache[key]
	},
	banks: async (country) => {
		var key = 'banks'
		var ret = self.cache.load(key)
		if (ret && ret[country]) return ret[country]

		self.cache.setpath(`${key}/${country}`, [])
		async function get_page(url) {
			var res = await self.get(url, () => {
				var data = []
				ls = document.querySelectorAll('.swift-country tr')
				for (var i = 1; i < ls.length; i++) {
					var o = ls[i].childNodes
					data.push({
						Name: o[1].innerHTML,
						City: o[2].innerHTML,
						Branch: o[3].innerHTML,
						SWIFT: o[4].childNodes[0].innerHTML
					})
				}
				var next = document.querySelector('.next')
				next = next.children.length > 0 && next.children[0].href
				return {data, next}
			})
			self.cache[key][country].push(... res.data)
			return res.next
		}
		var next = www + '/swift-code/' + country.lc().tr(' ', '-')
		while (next) {
			next = await get_page(next)
		}
		self.cache.save()
		return self.cache[key]
	}
}

Array.prototype.unique = function () {
	return this.filter((e, pos) => this.indexOf(e) == pos);
}

