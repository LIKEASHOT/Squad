import pymysql

class DatabaseExecutor:
    def __init__(self, host='localhost', user='root', password='your_password'):
        """初始化数据库连接参数"""
        self.host = host
        self.user = user
        self.password = password
        self.connection = None
    
    def connect(self):
        """连接到MySQL服务器"""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password
            )
            print("成功连接到MySQL服务器")
            return True
        except pymysql.MySQLError as e:
            print(f"连接错误: {e}")
            return False

    def execute_sql_file(self, file_path):
        """执行SQL文件"""
        if not self.connection:
            print("未连接到数据库")
            return False

        try:
            # 读取SQL文件
            with open(file_path, 'r', encoding='utf-8') as file:
                sql_script = file.read()

            # 创建游标
            cursor = self.connection.cursor()
            
            # 分割SQL语句
            sql_commands = sql_script.split(';')

            # 执行每条SQL语句
            for command in sql_commands:
                command = command.strip()
                if command:
                    try:
                        cursor.execute(command)
                        print(f"成功执行SQL语句: {command[:50]}...")
                    except pymysql.MySQLError as e:
                        print(f"执行错误: {e}")
                        print(f"问题SQL语句: {command}")

            # 提交更改
            self.connection.commit()
            print("SQL文件执行完成")
            return True

        except pymysql.MySQLError as e:
            print(f"执行文件时出错: {e}")
            return False
        except IOError as e:
            print(f"读取文件时出错: {e}")
            return False
        finally:
            if cursor:
                cursor.close()

    def close(self):
        """关闭数据库连接"""
        if self.connection:
            self.connection.close()
            print("数据库连接已关闭")

def main():
    # 创建数据库执行器实例
    executor = DatabaseExecutor(
        host='localhost',
        user='sport_admin',
        password='Aa@123456789'  # 替换为您的MySQL密码
    )

    # 连接到数据库
    if executor.connect():
        # 执行SQL文件
        sql_file_path = '数据库执行的sql.sql'  # SQL文件路径
        executor.execute_sql_file(sql_file_path)
        
        # 关闭连接
        executor.close()

if __name__ == "__main__":
    main()
