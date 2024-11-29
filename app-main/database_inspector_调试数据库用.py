import pymysql
from pymysql import Error
from tabulate import tabulate  # 用于格式化输出
import sys
import time

class DatabaseInspector:
    def __init__(self, host, user, password, database):
        self.config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database,
            'charset': 'utf8mb4'  # 添加字符集设置
        }
        self.connection = None
    
    def connect(self):
        """建立数据库连接"""
        try:
            print(f"正在尝试连接到数据库，配置信息：{self.config}")
            self.connection = pymysql.connect(
                **self.config,
                connect_timeout=5,  # 5秒超时
                cursorclass=pymysql.cursors.DictCursor  # 使用字典游标
            )
            print(f"成功连接到数据库 {self.config['database']}")
        except pymysql.Error as e:
            print(f"连接数据库时出错: {e}")
            print(f"错误代码: {e.args[0]}")
            print(f"错误信息: {e.args[1]}")
            sys.exit(1)
        except Exception as e:
            print(f"发生未预期的错误: {e}")
            print(f"错误类型: {type(e).__name__}")
            sys.exit(1)
    
    def disconnect(self):
        """关闭数据库连接"""
        if self.connection:
            self.connection.close()
            print("数据库连接已关闭")
    
    def get_tables(self):
        """获取所有表名"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            return [list(table.values())[0] for table in tables]
        except Error as e:
            print(f"获取表列表时出错: {e}")
            return []
        finally:
            cursor.close()
    
    def get_table_structure(self, table_name):
        """获取表结构"""
        cursor = None
        try:
            cursor = self.connection.cursor()
            
            # 获取表结构
            cursor.execute(f"DESCRIBE `{table_name}`")
            columns = cursor.fetchall()
            
            # 获取索引信息
            cursor.execute(f"SHOW INDEX FROM `{table_name}`")
            indexes = cursor.fetchall()
            
            # 获取创建表的SQL
            cursor.execute(f"SHOW CREATE TABLE `{table_name}`")
            create_table = cursor.fetchone()
            create_sql = create_table['Create Table'] if 'Create Table' in create_table else create_table[1]
            
            return {
                'columns': columns,
                'indexes': indexes,
                'create_sql': create_sql
            }
        except Error as e:
            print(f"获取表 {table_name} 结构时出错: {e}")
            return None
        except Exception as e:
            print(f"处理表 {table_name} 时发生未预期的错误: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
    
    def print_table_info(self, table_name, structure):
        """打印表信息"""
        print(f"\n{'='*80}")
        print(f"表名: {table_name}")
        print(f"{'='*80}")
        
        # 打印列信息
        print("\n列信息:")
        headers = ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra']
        # 从字典中提取需要的值，按照headers的顺序
        column_data = [[col['Field'], col['Type'], col['Null'], 
                       col['Key'], col['Default'], col['Extra']] 
                      for col in structure['columns']]
        print(tabulate(column_data, headers=headers, tablefmt='grid'))
        
        # 打印索引信息
        print("\n索引信息:")
        index_headers = ['Key_name', 'Column_name', 'Non_unique', 'Index_type']
        index_data = [[idx['Key_name'], idx['Column_name'], 
                      idx['Non_unique'], idx['Index_type']] 
                     for idx in structure['indexes']]
        print(tabulate(index_data, headers=index_headers, tablefmt='grid'))
        
        # 打印建表SQL
        print("\n建表SQL:")
        print(structure['create_sql'])
        print("\n")
    
    def get_table_data(self, table_name, limit=100):
        """获取表中的数据
        Args:
            table_name (str): 表名
            limit (int): 限制返回的行数，默认100行
        """
        cursor = None
        try:
            cursor = self.connection.cursor()
            
            # 获取总行数
            cursor.execute(f"SELECT COUNT(*) as count FROM `{table_name}`")
            total_count = cursor.fetchone()['count']
            
            # 获取数据
            cursor.execute(f"SELECT * FROM `{table_name}` LIMIT {limit}")
            data = cursor.fetchall()
            
            return {
                'total_count': total_count,
                'data': data
            }
        except Error as e:
            print(f"获取表 {table_name} 数据时出错: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
    
    def print_table_data(self, table_name, data):
        """打印表数据
        Args:
            table_name (str): 表名
            data (dict): 包含total_count和data的字典
        """
        if not data:
            return
        
        print(f"\n{'='*80}")
        print(f"表 {table_name} 的数据")
        print(f"总行数: {data['total_count']}")
        print(f"{'='*80}\n")
        
        if not data['data']:
            print("表中没有数据")
            return
        
        # 获取列名作为表头
        headers = data['data'][0].keys()
        # 提取数据
        rows = [[str(row[col])[:50] + '...' if len(str(row[col])) > 50 else str(row[col]) 
                for col in headers] 
               for row in data['data']]
        
        print(tabulate(rows, headers=headers, tablefmt='grid'))
    
    def truncate_table(self, table_name, safe_mode=True):
        """清空指定表的数据
        Args:
            table_name (str): 要清空的表名
            safe_mode (bool): 安全模式，True时会先备份数据
        Returns:
            bool: 操作是否成功
        """
        cursor = None
        try:
            cursor = self.connection.cursor()
            
            # 如果开启安全模式，先备份数据
            if safe_mode:
                backup_table = f"{table_name}_backup_{int(time.time())}"
                print(f"正在创建备份表 {backup_table}")
                cursor.execute(f"CREATE TABLE `{backup_table}` LIKE `{table_name}`")
                cursor.execute(f"INSERT INTO `{backup_table}` SELECT * FROM `{table_name}`")
                print(f"数据已备份到表 {backup_table}")
            
            # 使用 TRUNCATE 而不是 DELETE 来清空表
            # TRUNCATE 比 DELETE 更快，并且会重置自增ID
            cursor.execute(f"TRUNCATE TABLE `{table_name}`")
            self.connection.commit()
            
            print(f"表 {table_name} 已清空")
            return True
            
        except Error as e:
            self.connection.rollback()
            print(f"清空表 {table_name} 时出错: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
    
    def restore_backup(self, original_table, backup_table):
        """从备份表恢复数据
        Args:
            original_table (str): 原始表名
            backup_table (str): 备份表名
        Returns:
            bool: 操作是否成功
        """
        cursor = None
        try:
            cursor = self.connection.cursor()
            
            # 先清空原表
            cursor.execute(f"TRUNCATE TABLE `{original_table}`")
            
            # 从备份表恢复数据
            cursor.execute(f"INSERT INTO `{original_table}` SELECT * FROM `{backup_table}`")
            self.connection.commit()
            
            print(f"已从 {backup_table} 恢复数据到 {original_table}")
            return True
            
        except Error as e:
            self.connection.rollback()
            print(f"恢复数据时出错: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
    
    def drop_table(self, table_name):
        """删除指定的表
        Args:
            table_name (str): 要删除的表名
        Returns:
            bool: 操作是否成功
        """
        cursor = None
        try:
            cursor = self.connection.cursor()
            cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")
            self.connection.commit()
            print(f"表 {table_name} 已删除")
            return True
        except Error as e:
            self.connection.rollback()
            print(f"删除表 {table_name} 时出错: {e}")
            return False
        finally:
            if cursor:
                cursor.close()

def main():
    # 数据库连接配置
    config = {
        'host': 'localhost',     # 改为你的数据库主机地址
        'user': 'sport_admin',          # 改为你的数据库用户名
        'password': 'Aa@123456789',    # 改为你的数据库密码
        'database': 'Squad_db' # 改为你的数据库名
    }
    
    inspector = None
    try:
        # 创检查器实例
        inspector = DatabaseInspector(**config)
        
        # 连接数据库
        inspector.connect()
        
        # 获取所有表
        tables = inspector.get_tables()
        
        if not tables:
            print("数据库中没有找到表")
            return
        
        print(f"\n找到 {len(tables)} 个表:")
        for i, table in enumerate(tables, 1):
            print(f"{i}. {table}")
        
        while True:
            print("\n请选择操作：")
            print("1. 查看所有表的结构")
            print("2. 查看指定表的数据")
            print("3. 清空指定表数据")
            print("4. 删除指定表")
            print("5. 退出")
            
            choice = input("请输入选项编号: ")
            
            if choice == '1':
                # 获取并打印每个表的结构
                for table in tables:
                    structure = inspector.get_table_structure(table)
                    if structure:
                        inspector.print_table_info(table, structure)
            elif choice == '2':
                print("\n可用的表：")
                for i, table in enumerate(tables, 1):
                    print(f"{i}. {table}")
                    
                table_index = int(input("\n请输入要查看的表编号: ")) - 1
                if 0 <= table_index < len(tables):
                    table_name = tables[table_index]
                    limit = input("请输入要显示的最大行数（直接回车默认100行）: ")
                    limit = int(limit) if limit.strip() else 100
                    
                    data = inspector.get_table_data(table_name, limit)
                    inspector.print_table_data(table_name, data)
                else:
                    print("无效的表编号！")
            elif choice == '3':
                print("\n可用的表：")
                for i, table in enumerate(tables, 1):
                    print(f"{i}. {table}")
                    
                table_index = int(input("\n请输入要清空的表编号: ")) - 1
                if 0 <= table_index < len(tables):
                    table_name = tables[table_index]
                    confirm = input(f"警告：即将清空表 {table_name} 的所有数据，是否继续？(y/N): ")
                    if confirm.lower() == 'y':
                        safe_mode = input("是否需要先备份数据？(Y/n): ").lower() != 'n'
                        inspector.truncate_table(table_name, safe_mode)
                else:
                    print("无效的表编号！")
            elif choice == '4':
                print("\n可用的表：")
                for i, table in enumerate(tables, 1):
                    print(f"{i}. {table}")
                    
                table_index = int(input("\n请输入要删除的表编号: ")) - 1
                if 0 <= table_index < len(tables):
                    table_name = tables[table_index]
                    confirm = input(f"警告：即将删除表 {table_name}，此操作不可逆，是否继续？(y/N): ")
                    if confirm.lower() == 'y':
                        inspector.drop_table(table_name)
                        # 更新表列表
                        tables = inspector.get_tables()
                else:
                    print("无效的表编号！")
            elif choice == '5':
                break
            else:
                print("无效的选项，请重新选择")
    
    except Exception as e:
        print(f"程序执行出错: {str(e)}")
        import traceback
        print(traceback.format_exc())
    
    finally:
        if inspector:
            inspector.disconnect()

if __name__ == "__main__":
    main() 
    