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
		await page.goto(url, {waitUntil: 'load', timeout: 0})
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

		async function get_bank(url) {
			return await self.get(url, () => {
				var t = document.querySelector('table')
				var tr = t.children[1].children
				return Array.from(tr).map(o => o.children[1].innerHTML)
			})
		}
		async function get_list(url) {
			var {urls, next} = await self.get(url, () => {
				var urls = document.querySelectorAll('.swift-country tr a')
				var next = document.querySelector('.next')
				urls = Array.from(urls).map(o => o.href)
				next = next.children.length > 0 && next.children[0].href
				return {urls, next}
			})
			for (var i = 0; i < urls.length; i++) {
				var r = await get_bank(urls[i])
				// this patch handles variations in the structure of the page
				var m = r[0].match(/data-clipboard-text="(\S+)"/)
				if (m) { r[0] = m[1]; r.splice(1,2) }

				// create dictionary and attach it to output
				var o = r.dict('SWIFT/Name/Address/City/Branch/PostCode').tc()
				if (process.env.DEBUG) console.error(o)
				r = self.cache.setpath([key, country, o.Name, o.City], [], true) 
				r.push(o.slice('Branch/Address/PostCode/SWIFT'))
			}
			return next
		}

		var next = www + '/swift-code/' + country.lc().tr(' ', '-')
		if (country.startsWith('http')) next = country
		while (next) {
			next = await get_list(next)
			self.cache.save()
		}
		return self.cache[key][country]
	}
}

Array.prototype.unique = function () {
	return this.filter((e, pos) => this.indexOf(e) == pos);
}

