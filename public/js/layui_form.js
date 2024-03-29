/**
 @Name：layui.form 表单组件
 @Author：贤心
 @License：LGPL
		
 */
 
;(function(){
	"use strict";


	//异常提示
	var error = function(msg){
	  win.console && console.error && console.error('Layui hint: ' + msg);
	}

	var each = function(obj, fn){
		var that = this, key;
	  	if(typeof fn !== 'function') return that;
	  	obj = obj || [];
	  	if(obj.constructor === Object){
	    	for(key in obj){
	      		if(fn.call(obj[key], key, obj[key])) break;
	    	}
	  	} else {
	    	for(key = 0; key < obj.length; key++){
	      		if(fn.call(obj[key], key, obj[key])) break;
	    	}
	  	}
	  	return that;
	};

	var eventObj = {};

	//自定义模块事件
	var onevent = function(modName, events, callback){
		if(typeof modName !== 'string' 
		|| typeof callback !== 'function') return this;
		eventObj[modName + '.' + events] = [callback];
		return this;
	};

	//执行自定义模块事件
	var trigger = function(modName, events, params){
		var that = this, result = null, filter = events.match(/\(.*\)$/)||[]; //提取事件过滤器
		var set = (events = modName + '.'+ events).replace(filter, ''); //获取事件本体名
		var callback = function(_, item){
			var res = item && item.call(that, params);
			res === false && result === null && (result = false);
		};
		each(eventObj[set], callback);
		(filter[0] && filter[0].indexOf('undefined')==-1) && each(eventObj[events], callback); //执行过滤器中的事件
		return result;
	};


	
	var MOD_NAME = 'form', ELEM = '.layui-form', THIS = 'layui-this', SHOW = 'layui-show', DISABLED = 'layui-disabled'
	
	,Form = function(){
		this.config = {
			verify: {
				required: [
					/[\S]+/
					,'必填项不能为空'
				]
				,phone: [
					/^1\d{10}$/
					,'请输入正确的手机号'
				]
				,email: [
					/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
					,'邮箱格式不正确'
				]
				,url: [
					/(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/
					,'链接格式不正确'
				]
				,number: [
					/^\d+$/
					,'只能填写数字'
				]
				,date: [
					/^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/
					,'日期格式不正确'
				]
				,identity: [
					/(^\d{15}$)|(^\d{17}(x|X|\d)$)/
					,'请输入正确的身份证号'
				]
			}
		};
	};
	
	//全局设置
	Form.prototype.set = function(options){
		var that = this;
		$.extend(true, that.config, options);
		return that;
	};
	
	//验证规则设定
	Form.prototype.verify = function(settings){
		var that = this;
		$.extend(true, that.config.verify, settings);
		return that;
	};
	
	//表单事件监听
	Form.prototype.on = function(events, callback){
		return onevent(MOD_NAME, events, callback);
	};
	
	//表单控件渲染
	Form.prototype.render = function(type){
		var that = this, items = {
			//下拉选择框
			select: function(){
				var TIPS = '请选择', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
				
				,selects = $(ELEM).find('select'), hide = function(e, clear){
					if(!$(e.target).parent().hasClass(TITLE) || clear){
						$('.'+CLASS).removeClass(CLASS+'ed');
					}
				}
				
				,events = function(reElem, disabled){
					var select = $(this), title = reElem.find('.' + TITLE);
					
					if(disabled) return;
					
					//展开下拉
					title.on('click', function(e){
						reElem.hasClass(CLASS+'ed') ? reElem.removeClass(CLASS+'ed') : (
							hide(e, true), 
							reElem.addClass(CLASS+'ed')
						);
					});
					
					//选择
					reElem.find('dl>dd').on('click', function(){
						var othis = $(this), value = othis.attr('lay-value');
						var filter = select.attr('lay-filter'); //获取过滤器

						if(othis.hasClass(DISABLED)) return false;
						
						select.val(value), title.find('input').val(othis.text());
						othis.addClass(THIS).siblings().removeClass(THIS);
						trigger(MOD_NAME, 'select('+ filter +')', {
							elem: select[0]
							,value: value
						});
					});
					
					reElem.find('dl>dt').on('click', function(e){
						return false;
					});
					
					//关闭下拉
					$(document).off('click', hide).on('click', hide)
				}
				
				selects.each(function(index, select){
					var othis = $(this), hasRender = othis.next('.'+CLASS), disabled = this.disabled;
					var value = select.value, selected = $(select.options[select.selectedIndex]); //获取当前选中项
					console.log(othis.find('*'));
					//替代元素
					var reElem = $([
						'<div class="layui-unselect '+ CLASS + (disabled ? ' layui-select-disabled' : '') +'">'
						,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ (select.options[0].innerHTML ? select.options[0].innerHTML : TIPS) +'" value="'+ (value ? selected.html() : '') +'" readonly class="layui-input layui-unselect'+ (disabled ? (' '+DISABLED) : '') +'">'
						,'<i class="layui-edge"></i></div>'
						,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'+ function(options){
							var arr = [];
							each(options, function(index, item){
								if(index === 0 && !item.value) return;
								if(item.tagName.toLowerCase() === 'optgroup'){
									arr.push('<dt>'+ item.label +'</dt>'); 
								} else {
									arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
								}
							});
							return arr.join('');
						}(othis.find('*')) +'</dl>'
					,'</div>'].join(''));
					
					hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
					othis.after(reElem);
					events.call(this, reElem, disabled);
				});
			}
			//复选框/开关
			,checkbox: function(){
				var CLASS = {
					checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
					,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
				}
				,checks = $(ELEM).find('input[type=checkbox]')
				
				,events = function(reElem, RE_CLASS){
					var check = $(this);
					
					//勾选
					reElem.on('click', function(){
						var filter = check.attr('lay-filter'); //获取过滤器

						if(check[0].disabled) return;
						
						check[0].checked ? (
							check[0].checked = false
							,reElem.removeClass(RE_CLASS[1])
						) : (
							check[0].checked = true
							,reElem.addClass(RE_CLASS[1])
						);
						trigger(MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
							elem: check[0]
							,value: check[0].value
						});
					});
				}
				
				checks.each(function(index, check){
					var othis = $(this), skin = othis.attr('lay-skin'), disabled = this.disabled;
					if(skin === 'switch') skin = '_'+skin;
					var RE_CLASS = CLASS[skin] || CLASS.checkbox;
					
					//替代元素
					var hasRender = othis.next('.' + RE_CLASS[0]);
					var reElem = $(['<div class="layui-unselect '+ RE_CLASS[0] + (
						check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' layui-checkbox-disbaled '+DISABLED : '') +'">'
					,{
						_switch: '<i></i>'
					}[skin] || ('<span>'+ (check.title || '勾选') +'</span><i class="layui-icon"></i>')
					,'</div>'].join(''));

					hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
					othis.after(reElem);
					events.call(this, reElem, RE_CLASS);
				});
			}
			//单选框
			,radio: function(){
				var CLASS = 'layui-form-radio'
				,radios = $(ELEM).find('input[type=radio]')
				
				,events = function(reElem){
					var radio = $(this);
					
					reElem.on('click', function(){
						var name = radio[0].name, forms = radio.parents(ELEM);
						var filter = radio.attr('lay-filter'); //获取过滤器
						var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //找到相同name的兄弟
						
						if(radio[0].disabled) return;
						
						each(sameRadio, function(){
							var next = $(this).next('.'+CLASS);
							this.checked = false;
							next.removeClass(CLASS+'ed');
						});
						
						radio[0].checked = true;
						reElem.addClass(CLASS+'ed');
						
						trigger(MOD_NAME, 'radio('+ filter +')', {
							elem: radio[0]
							,value: radio[0].value
						});
					});
				};
				
				radios.each(function(index, radio){
					var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;
					
					//替代元素
					var reElem = $(['<div class="layui-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' layui-radio-disbaled '+DISABLED : '') +'">'
					,'<i class="layui-icon"></i>'
					,'<span>'+ (radio.title||'未命名') +'</span>'
					,'</div>'].join(''));
					
					hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
					othis.after(reElem);
					events.call(this, reElem);
				});
			}
		};
		type ? (
			items[type] ? items[type]() : error('不支持的'+ type + '表单渲染')
		) : each(items, function(index, item){
			item();
		});
		return that;
	};
	
	//表单提交校验
	var submit = function(){

		var button = $(this), verify = form.config.verify, stop = null
		,DANGER = 'layui-form-danger', field = {} ,elem = button.parents(ELEM)
		
		,verifyElem = elem.find('*[lay-verify]') //获取需要校验的元素
		,formElem = button.parents('form')[0] //获取当前所在的form元素，如果存在的话
		,fieldElem = elem.find('input,select,textarea') //获取所有表单域
		,filter = button.attr('lay-filter'); //获取过滤器
 
		//开始校验
		each(verifyElem, function(_, item){
			var othis = $(this), ver = othis.attr('lay-verify'), tips = '';
			var value = othis.val(), isFn = typeof verify[ver] === 'function';
			othis.removeClass(DANGER);
			if(verify[ver] && (isFn ? tips = verify[ver](value, item) : !verify[ver][0].test(value)) ){
				layer.msg(tips || verify[ver][1], {
					icon: 5
					,shift: 6
				});

				item.focus();

				othis.addClass(DANGER);
				return stop = true;
			}
		});
		
		if(stop) return false;
		
		each(fieldElem, function(_, item){
			if(!item.name) return;
			if(/^checkbox|radio$/.test(item.type) && !item.checked) return;
			field[item.name] = item.value;
		});
 

		//获取字段
		return trigger.call(this, MOD_NAME, 'submit('+ filter +')', {
			elem: this
			,form: formElem
			,field: field
		});

		return false;
	};

	//自动完成渲染
	var form = new Form(), dom = $(document);
	form.render();
	
	//表单reset重置渲染
	dom.on('reset', ELEM, function(){
		setTimeout(function(){
			form.render();
		}, 50);
	});
	
	//表单提交事件
	dom.on('submit', ELEM, submit)
	.on('click', '*[lay-submit]', submit);


	window.layui_form = form;

	//module.exports = form;

	
	//exports(MOD_NAME, function(options){
		//return form.set(options);
	//});
	
	//window.layui_form = form.set(options);
	
})();